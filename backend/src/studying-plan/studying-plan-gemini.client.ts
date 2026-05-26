import { Injectable } from "@nestjs/common";
import {
  AI_PROMPT_ENV_KEYS,
  DEFAULT_PROMPT_STUDYING_PLAN,
  DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA,
} from "src/config/ai-prompts.defaults";
import { buildAiPrompt, loadAiPromptTemplate } from "src/config/ai-prompts";
import { DISTINCT_PASSED_LESSONS_PER_PHASE_STEP } from "./studying-plan.constants";
import {
  STRUCTURED_STUDY_FRACTION,
  type HorizonBudget,
} from "./studying-plan-horizon.util";
import {
  parsePlanTask,
  wrapStudyingPlanV2,
  type PlanTask,
  type StoredStudyingPlanPhaseV2,
  type StoredStudyingPlanV2,
} from "./studying-plan-json.util";
import {
  streakTargetForPhase,
  videosPassedPlanTargetForPhase,
  vocabularyTargetForPhase,
  type CoarseLevelTier,
} from "./studying-plan-level.util";
import {
  formatCatalogTopicsForPrompt,
  formatPhaseTopicsForPrompt,
  type CatalogTopicForPlan,
  type StudyingPlanTopicRef,
} from "./studying-plan-topic-selection.util";
import {
  formatLearnerProfileForPrompt,
  type StudyingPlanLearnerProfile,
} from "./studying-plan-learner-profile.util";
import { expectedCefrLevelForPhase } from "./studying-plan-cefr.util";

export type StudyingPlanGenerationInput = {
  learnerProfile: StudyingPlanLearnerProfile;
  catalogTopics: CatalogTopicForPlan[];
  topicsByPhase: StudyingPlanTopicRef[][];
  budget: HorizonBudget;
  tier: CoarseLevelTier;
};

const PHASE_COUNT = 4;
const WEEKLY_HABITS_COUNT = 3;

@Injectable()
export class StudyingPlanGeminiClient {
  async generate(
    input: StudyingPlanGenerationInput,
  ): Promise<StoredStudyingPlanV2 | null> {
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const apiUrl =
      process.env.GEMINI_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const { learnerProfile, budget, tier } = input;
    const pct = Math.round(STRUCTURED_STUDY_FRACTION * 100);
    const phaseHintLines = [0, 1, 2, 3].map((i) => {
      const d = budget.phaseMinDays[i];
      const w = budget.phaseMinWeeks[i];
      const streak = streakTargetForPhase(i, budget.structuredStudyWeeks);
      const videos = videosPassedPlanTargetForPhase(i);
      const words = vocabularyTargetForPhase(tier, i);
      const level = expectedCefrLevelForPhase(
        learnerProfile.englishLevel,
        i,
        PHASE_COUNT,
      );
      return `  Phase ${i + 1}: expectedLevel **${level}**; min_phase_calendar_days ≈ ${d} (≈${w} weeks); streak ≥ ${streak}; distinct videos passed ≥ ${videos} at ≥70%; new words ≈ ${words}.`;
    });

    const timelineBlock = [
      "TIMELINE:",
      `- Horizon ≈ **${budget.approxTotalDays} days** (~**${budget.approxTotalWeeks} weeks**).`,
      `- Exactly **${PHASE_COUNT} phases** covering ~**${budget.structuredStudyDays} days** (~**${pct}%** of horizon).`,
      `- Final phase must clearly connect to the learner's stated **goal**.`,
    ];

    const phaseSchemaBlock = [
      "PHASE SHAPE (exactly 4 phases):",
      '- "title" (string), "summary" (1–2 sentences toward the goal)',
      '- "expectedLevel" (CEFR string e.g. A2, B1 — use hints below)',
      `- "transitionCondition" (one string: measurable rule to advance; app advances after **${DISTINCT_PASSED_LESSONS_PER_PHASE_STEP} distinct** passed videos at ≥70% AND passing the phase final test at ≥70%)`,
      '- "actions" (2–4 short strings — habits, not calendar pacing)',
      '- "tasks" (non-empty array — see TASK SCHEMA)',
      "- Use pre-assigned phase topics in summary/actions; do not invent topic names.",
    ].join("\n");

    const topicsBlock = [
      "CATALOGUE TOPICS (database):",
      formatCatalogTopicsForPrompt(input.catalogTopics),
      "",
      "PHASE TOPICS (fixed per phase):",
      formatPhaseTopicsForPrompt(input.topicsByPhase),
    ];

    const profileBlock = formatLearnerProfileForPrompt(learnerProfile);

    const taskSchema = loadAiPromptTemplate(
      AI_PROMPT_ENV_KEYS.studyingPlanTaskSchema,
      DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA,
    );
    const prompt = buildAiPrompt(
      AI_PROMPT_ENV_KEYS.studyingPlan,
      DEFAULT_PROMPT_STUDYING_PLAN,
      {
        PHASE_COUNT: String(PHASE_COUNT),
        WEEKLY_HABITS_COUNT: String(WEEKLY_HABITS_COUNT),
        TASK_SCHEMA: taskSchema,
        TIMELINE_BLOCK: timelineBlock.join("\n"),
        PHASE_SCHEMA_BLOCK: phaseSchemaBlock,
        TOPICS_BLOCK: topicsBlock.join("\n"),
        PROFILE_BLOCK: profileBlock,
        PHASE_HINT_LINES: phaseHintLines.join("\n"),
        LEARNING_GOAL: learnerProfile.learningGoal,
        TIME_HORIZON: learnerProfile.timeHorizon,
        ENGLISH_LEVEL: learnerProfile.englishLevel || "unknown",
        HOBBIES:
          learnerProfile.hobbies.length > 0 ?
            learnerProfile.hobbies.join(", ")
          : "(none)",
        JOB: learnerProfile.job ?? learnerProfile.workField ?? "(not specified)",
        EDUCATION: learnerProfile.education ?? "(not specified)",
        TAGS:
          learnerProfile.tagNames.length > 0 ?
            learnerProfile.tagNames.slice(0, 40).join(", ")
          : "(none)",
      },
    );

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string") {
        return null;
      }
      const parsed = JSON.parse(text) as {
        phases?: unknown;
        weeklyHabits?: unknown;
      };
      const phases = normalizePhases(parsed?.phases);
      const weeklyHabits = normalizeWeekly(parsed?.weeklyHabits);
      if (phases.length !== PHASE_COUNT || weeklyHabits.length !== WEEKLY_HABITS_COUNT) {
        return null;
      }
      return wrapStudyingPlanV2(phases, weeklyHabits);
    } catch {
      return null;
    }
  }
}

function normalizePhases(raw: unknown): StoredStudyingPlanPhaseV2[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredStudyingPlanPhaseV2[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title =
      typeof o.title === "string" ? o.title.trim().slice(0, 220) : "";
    const summary =
      typeof o.summary === "string" ? o.summary.trim().slice(0, 2000) : "";
    const actions = stringArrayField(o.actions, 40, 2000);
    const expectedLevel =
      typeof o.expectedLevel === "string" ?
        o.expectedLevel.trim().slice(0, 32)
      : undefined;
    const transitionCondition =
      typeof o.transitionCondition === "string" ?
        o.transitionCondition.trim().slice(0, 2000)
      : undefined;
    if (!Array.isArray(o.tasks) || o.tasks.length === 0) continue;
    const tasks = normalizeTasksArray(o.tasks);
    if (tasks.length === 0) continue;
    if (title.length < 4 || summary.length < 8 || actions.length < 2) {
      continue;
    }
    out.push({
      title,
      summary,
      actions,
      tasks,
      ...(expectedLevel ? { expectedLevel } : {}),
      ...(transitionCondition ? { transitionCondition } : {}),
    });
  }
  return out;
}

function normalizeTasksArray(raw: unknown[]): PlanTask[] {
  const out: PlanTask[] = [];
  for (const item of raw) {
    const t = parsePlanTask(item);
    if (!t) {
      return [];
    }
    out.push(t);
  }
  return out;
}

function normalizeWeekly(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") continue;
    const s = x.trim().slice(0, 500);
    if (s.length > 0) out.push(s);
  }
  return out.slice(0, WEEKLY_HABITS_COUNT);
}

function stringArrayField(
  raw: unknown,
  maxLen: number,
  maxStr: number,
): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw.slice(0, maxLen)) {
    if (typeof x !== "string") continue;
    const s = x.trim().slice(0, maxStr);
    if (s.length > 0) out.push(s);
  }
  return out;
}
