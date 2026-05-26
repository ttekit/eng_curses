import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Prisma } from "src/generated/prisma/client";
import {
  effectiveLearningGoal,
  effectiveTimeHorizon,
} from "src/content-video/studying-plan.util";
import {
  parseStudyingPlanV2OrNull,
  parseStudyingPlanV2Strict,
  wrapStudyingPlanV2,
  type StoredStudyingPlanPhaseV2,
  type StoredStudyingPlanV2,
} from "./studying-plan-json.util";
import { horizonBudgetFromLabel } from "./studying-plan-horizon.util";
import { coarseLevelTier } from "./studying-plan-level.util";
import {
  buildPlanTasksForPhase,
} from "./studying-plan-pass-conditions.builder";
import { StudyingPlanGeminiClient } from "./studying-plan-gemini.client";
import {
  selectTopicsForPhases,
  type CatalogTopicForPlan,
  type StudyingPlanTopicRef,
  type StudyingPlanTopicSelectionContext,
} from "./studying-plan-topic-selection.util";
import { enrichStudyingPlanPhases } from "./studying-plan-phase-enrichment.util";
import {
  type StudyingPlanLearnerProfile,
} from "./studying-plan-learner-profile.util";
import { syncActiveStudyingPhaseForUser } from "./sync-active-studying-phase";

const PHASE_COUNT = 4;

@Injectable()
export class StudyingPlanRegenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: StudyingPlanGeminiClient,
  ) {}

  /**
   * Resolves catalogue topics per phase (stored plan topics or profile-based selection).
   */
  async resolvePhaseTopicsForUser(
    userId: number,
  ): Promise<StudyingPlanTopicRef[][]> {
    const ctx = await this.loadUserTopicSelectionContext(userId);
    if (!ctx) {
      return [];
    }
    const { catalogTopics, topicContext, studyingPlanPhases } = ctx;
    const plan = parseStudyingPlanV2OrNull(studyingPlanPhases);
    const phaseCount = plan?.phases.length ?? PHASE_COUNT;
    const selectedByPhase = selectTopicsForPhases(
      catalogTopics,
      topicContext,
      phaseCount,
    );
    if (!plan) {
      return selectedByPhase;
    }
    return plan.phases.map((phase, index) => {
      if (phase.topics?.length) {
        return phase.topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
        }));
      }
      return selectedByPhase[index] ?? [];
    });
  }

  async regenerateForUser(userId: number): Promise<StoredStudyingPlanV2> {
    const ctx = await this.loadUserTopicSelectionContext(userId);
    if (!ctx) {
      throw new NotFoundException("User not found");
    }
    const {
      extra,
      catalogTopics,
      topicContext,
      learnerProfile,
      learningGoal,
      timeHorizon,
      englishLevel,
      hobbies,
    } = ctx;
    const topicsByPhase = selectTopicsForPhases(
      catalogTopics,
      topicContext,
      PHASE_COUNT,
    );

    const budget = horizonBudgetFromLabel(timeHorizon);
    const tier = coarseLevelTier(englishLevel.trim() || "");

    const fromGemini = await this.gemini.generate({
      learnerProfile,
      catalogTopics,
      topicsByPhase,
      budget,
      tier,
    });

    const rawPlan =
      fromGemini ??
      this.fallbackPlan(learnerProfile, budget, tier);
    const enrichedPhases = enrichStudyingPlanPhases({
      phases: rawPlan.phases,
      topicsByPhase,
      englishLevel,
      learningGoal,
      budget,
      tier,
    });

    let plan: StoredStudyingPlanV2;
    try {
      plan = parseStudyingPlanV2Strict({
        ...rawPlan,
        phases: enrichedPhases,
      });
    } catch {
      throw new BadRequestException("Generated studying plan failed validation");
    }

    const json = plan as unknown as Prisma.InputJsonValue;

    await this.prisma.additionalUserData.upsert({
      where: { userId },
      create: {
        userId,
        learningGoal: extra?.learningGoal ?? null,
        timeToAchieve: extra?.timeToAchieve ?? null,
        englishLevel: extra?.englishLevel ?? null,
        hobbies,
        studyingPlanPhases: json,
      },
      update: {
        studyingPlanPhases: json,
      },
    });

    await syncActiveStudyingPhaseForUser(this.prisma, userId);

    return plan;
  }

  private async loadUserTopicSelectionContext(userId: number): Promise<{
    extra: {
      learningGoal: string | null;
      timeToAchieve: string | null;
      englishLevel: string | null;
      job: string | null;
      workField: string | null;
      education: string | null;
      hobbies: string[];
      interests: string[];
      studyingPlanPhases: unknown;
      selectedTopics: Array<{ id: number; tags: Array<{ name: string }> }>;
    } | null;
    studyingPlanPhases: unknown;
    catalogTopics: CatalogTopicForPlan[];
    topicContext: StudyingPlanTopicSelectionContext;
    learnerProfile: StudyingPlanLearnerProfile;
    learningGoal: string;
    timeHorizon: string;
    englishLevel: string;
    hobbies: string[];
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        additionalUserData: {
          select: {
            learningGoal: true,
            timeToAchieve: true,
            englishLevel: true,
            job: true,
            workField: true,
            education: true,
            hobbies: true,
            interests: true,
            studyingPlanPhases: true,
            selectedTopics: {
              select: { id: true, tags: { select: { name: true } } },
            },
          },
        },
      },
    });
    if (!user?.additionalUserData) {
      return null;
    }
    const extra = user.additionalUserData;
    const learningGoal = effectiveLearningGoal(extra.learningGoal);
    const timeHorizon = effectiveTimeHorizon(extra.timeToAchieve);
    const englishLevel = extra.englishLevel?.trim() || "your current level";
    const hobbies = Array.isArray(extra.hobbies)
      ? extra.hobbies.map((h) => String(h).trim()).filter((h) => h.length > 0)
      : [];
    const interests = Array.isArray(extra.interests)
      ? extra.interests.map((h) => String(h).trim()).filter((h) => h.length > 0)
      : [];
    const [catalogTopics, tagRows] = await Promise.all([
      this.loadCatalogTopics(),
      this.prisma.tag.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    const selectedTopicTagNames = extra.selectedTopics.flatMap((topic) =>
      topic.tags.map((tag) => tag.name),
    );
    const tagNames = [
      ...new Set([
        ...tagRows.map((tag) => tag.name),
        ...selectedTopicTagNames,
      ]),
    ];
    const learnerProfile: StudyingPlanLearnerProfile = {
      learningGoal,
      timeHorizon,
      englishLevel,
      job: extra.job?.trim() || null,
      workField: extra.workField?.trim() || null,
      education: extra.education?.trim() || null,
      hobbies,
      tagNames,
    };
    const topicContext: StudyingPlanTopicSelectionContext = {
      learningGoal,
      englishLevel,
      hobbies,
      interests,
      job: learnerProfile.job,
      workField: learnerProfile.workField,
      education: learnerProfile.education,
      tagNames,
      selectedTopicIds: extra.selectedTopics.map((topic) => topic.id),
    };
    return {
      extra,
      studyingPlanPhases: extra.studyingPlanPhases,
      catalogTopics,
      topicContext,
      learnerProfile,
      learningGoal,
      timeHorizon,
      englishLevel,
      hobbies,
    };
  }

  private async loadCatalogTopics(): Promise<CatalogTopicForPlan[]> {
    const rows = await this.prisma.topic.findMany({
      include: {
        category: { select: { name: true } },
        tags: { select: { name: true } },
      },
      orderBy: [{ complexity: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      categoryName: row.category.name,
      complexity: row.complexity,
      tagNames: row.tags.map((tag) => tag.name),
    }));
  }

  private fallbackPlan(
    profile: StudyingPlanLearnerProfile,
    budget: ReturnType<typeof horizonBudgetFromLabel>,
    tier: ReturnType<typeof coarseLevelTier>,
  ): StoredStudyingPlanV2 {
    const { learningGoal: goal, timeHorizon: horizon, hobbies: hobbiesNote } =
      profile;
    const hobbyLine =
      hobbiesNote.length > 0 ?
        ` Tie clips to interests like ${hobbiesNote.slice(0, 3).join(", ")}.`
      : "";
    const jobLine =
      profile.job || profile.workField ?
        ` Use workplace language from **${profile.job ?? profile.workField}**.`
      : "";

    const phaseBlueprints: Array<{
      title: string;
      summary: string;
      actions: string[];
    }> = [
      {
        title: "Phase 1 — Foundation & habit",
        summary: `Build a steady routine and secure basics on the path to: **${goal}**.`,
        actions: [
          "Schedule 2–3 short weekly catalog sessions with comprehension checks.",
          "Start with lessons at your current band; finish every quiz.",
          "Save new words that match your profile tags and daily life.",
        ],
      },
      {
        title: "Phase 2 — Expand input",
        summary:
          "Widen listening range with topics matched to your profile and tags.",
        actions: [
          "Add one slightly harder theme each week.",
          `Choose clips aligned with your goal (**${goal}**).${hobbyLine}`,
          "Re-watch a clip once without subtitles, then with support.",
        ],
      },
      {
        title: "Phase 3 — Apply in context",
        summary:
          "Turn comprehension into short output connected to your real-life goal.",
        actions: [
          "After each lesson, say or write 3 sentences in English.",
          `Practise scenarios useful for **${goal}**.${jobLine}`,
          "Redo one older quiz monthly to confirm retention.",
        ],
      },
      {
        title: "Phase 4 — Reach the goal",
        summary: `Consolidate skills through **${horizon}** until **${goal}** feels achievable in practice.`,
        actions: [
          "Keep minimum weekly watch time even on busy weeks.",
          "Prefer finishing topic sequences over random browsing.",
          "Adjust pace if life changes — the plan should stay honest.",
        ],
      },
    ];

    const phases: StoredStudyingPlanPhaseV2[] = phaseBlueprints.map(
      (blueprint, phaseIndex) => ({
        ...blueprint,
        tasks: buildPlanTasksForPhase({ phaseIndex, budget, tier }),
        passConditions: [],
      }),
    );

    return wrapStudyingPlanV2(phases, [
      `At least **${Math.max(2, Math.round(budget.structuredStudyWeeks / 6))}** catalog sessions with quizzes each week.`,
      "Review vocabulary from last week's lessons once per week.",
      `Every session should connect to your goal: **${goal}**.`,
    ]);
  }
}
