import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma.service";
import { parseStudyingPlanV2OrNull } from "src/studying-plan/studying-plan-json.util";
import {
  PHASE_FINAL_TEST_MIN_SCORE_PCT,
  PHASE_FINAL_TEST_QUESTION_COUNT,
} from "src/studying-plan/studying-plan.constants";
import { phaseCountFromStoredPhases } from "src/content-video/studying-plan-phase-progress.util";
import { PlacementTestService } from "src/placement-test/placement-test.service";
import type { PlacementQuestion } from "src/placement-test/placement-test.types";
import { scoreAgainstDraft } from "src/placement-test/placement-level.util";
import { resolveParentPostMessageOrigin } from "src/common/utils/parent-post-message-origin.util";
import { renderPlacementHtml } from "src/placement-test/placement-html.template";
import type { PlacementTestPayload } from "src/placement-test/placement-test.types";
import { syncActiveStudyingPhaseForUser } from "src/studying-plan/sync-active-studying-phase";
import {
  arePhaseFinalTestPrerequisitesMetForPhase,
  loadPhaseAdvanceProgress,
} from "src/studying-plan/studying-plan-phase-prerequisites.util";
import { PHASE_FINAL_TEST_DRAFT_VERSION } from "./phase-final-test-draft.types";
import { parsePhaseFinalTestDraft } from "./phase-final-test-draft.types";
import {
  hasPassedPhaseFinalTest,
  markPhaseFinalTestPassed,
  parsePhaseFinalTestProgress,
} from "./phase-final-test-progress.util";

type CompleteBody = {
  access_token?: string;
  answers?: Record<string, number>;
};

@Injectable()
export class PhaseFinalTestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly placementTest: PlacementTestService,
  ) {}

  async getStatus(userId: number): Promise<{
    activePhaseIndex: number;
    phaseCount: number;
    requiresFinalTestForActivePhase: boolean;
    hasPassedActivePhaseFinalTest: boolean;
    passedPhaseIndices: number[];
  }> {
    const ctx = await this.loadUserPlanContext(userId);
    const progress = parsePhaseFinalTestProgress(ctx.phaseFinalTestProgress);
    const activePhaseIndex = ctx.activeStudyingPhaseIndex;
    const isLastPhase = activePhaseIndex >= ctx.phaseCount - 1;
    const hasPassed = hasPassedPhaseFinalTest(progress, activePhaseIndex);
    return {
      activePhaseIndex,
      phaseCount: ctx.phaseCount,
      requiresFinalTestForActivePhase: !isLastPhase,
      hasPassedActivePhaseFinalTest: hasPassed,
      passedPhaseIndices: progress.passedPhaseIndices,
    };
  }

  async renderDocumentHtml(
    userId: number,
    accessToken: string,
    apiPublicOrigin: string,
  ): Promise<string> {
    const ctx = await this.loadUserPlanContext(userId);
    if (ctx.activeStudyingPhaseIndex >= ctx.phaseCount - 1) {
      throw new BadRequestException(
        "Phase final test is not required on the last plan phase",
      );
    }
    const progress = parsePhaseFinalTestProgress(ctx.phaseFinalTestProgress);
    if (hasPassedPhaseFinalTest(progress, ctx.activeStudyingPhaseIndex)) {
      throw new BadRequestException(
        "You have already passed the final test for this phase",
      );
    }
    await this.assertPhaseFinalTestPrerequisites(
      userId,
      ctx.activeStudyingPhaseIndex,
      ctx,
    );
    const phase = ctx.plan?.phases[ctx.activeStudyingPhaseIndex];
    const topicNames =
      phase?.topics?.map((t) => t.name).filter(Boolean) ?? [];
    const expectedLevel = phase?.expectedLevel?.trim() || ctx.englishLevel;
    const knowledgeTags = [
      `phase:${ctx.activeStudyingPhaseIndex + 1}`,
      `level:${expectedLevel}`,
      ...topicNames.map((name) => `topic:${name}`),
      ...(ctx.hobbies ?? []).map((h) => `hobby:${h}`),
    ];
    const questions = await this.placementTest.buildMcqQuestionsForContext(
      {
        name: ctx.userName,
        cefrHint: expectedLevel,
        knowledgeTags,
      },
      PHASE_FINAL_TEST_QUESTION_COUNT,
    );
    await this.persistDraft(userId, ctx.activeStudyingPhaseIndex, questions);
    const payload: PlacementTestPayload = {
      title: `Phase ${ctx.activeStudyingPhaseIndex + 1} final test`,
      knowledgeTags,
      cefrHint: expectedLevel,
      questions,
      completePath: "/phase-final-test/complete",
      completeEventType: "phase_final_test_complete",
    };
    const xApi = this.config.get<string>("API_TOKEN");
    const parentOrigin = resolveParentPostMessageOrigin(this.config);
    return renderPlacementHtml(
      payload,
      accessToken,
      xApi,
      apiPublicOrigin,
      parentOrigin,
    );
  }

  async completePhaseFinalTest(
    userId: number,
    body: CompleteBody,
  ): Promise<{
    ok: true;
    passed: boolean;
    percentage: number;
    phaseIndex: number;
    minScorePct: number;
  }> {
    const answers = this.coerceAnswers(body.answers);
    const ctx = await this.loadUserPlanContext(userId);
    const draft = parsePhaseFinalTestDraft(ctx.phaseFinalTestDraft);
    if (!draft) {
      throw new BadRequestException(
        "No active phase test session. Open the test again from your learning plan.",
      );
    }
    if (draft.phaseIndex !== ctx.activeStudyingPhaseIndex) {
      throw new BadRequestException(
        "This test session is for a different phase. Start a new test from your current phase.",
      );
    }
    await this.assertPhaseFinalTestPrerequisites(
      userId,
      ctx.activeStudyingPhaseIndex,
      ctx,
    );
    const scored = scoreAgainstDraft(draft.questions, answers);
    const percentage =
      scored.total > 0 ?
        Math.round((100 * scored.score) / scored.total)
      : 0;
    const passed = percentage >= PHASE_FINAL_TEST_MIN_SCORE_PCT;
    let progress = parsePhaseFinalTestProgress(ctx.phaseFinalTestProgress);
    if (passed) {
      progress = markPhaseFinalTestPassed(progress, draft.phaseIndex);
    }
    await this.prisma.additionalUserData.update({
      where: { userId },
      data: {
        phaseFinalTestDraft: Prisma.DbNull,
        phaseFinalTestProgress: progress as object,
      },
    });
    await syncActiveStudyingPhaseForUser(this.prisma, userId);
    return {
      ok: true,
      passed,
      percentage,
      phaseIndex: draft.phaseIndex,
      minScorePct: PHASE_FINAL_TEST_MIN_SCORE_PCT,
    };
  }

  private async persistDraft(
    userId: number,
    phaseIndex: number,
    questions: PlacementQuestion[],
  ): Promise<void> {
    await this.prisma.additionalUserData.update({
      where: { userId },
      data: {
        phaseFinalTestDraft: {
          v: PHASE_FINAL_TEST_DRAFT_VERSION,
          phaseIndex,
          issuedAt: new Date().toISOString(),
          questions: questions.map((q) => ({
            id: q.id,
            correctIndex: q.correctIndex,
            type: q.type,
            promptShort: q.prompt.replace(/\s+/g, " ").trim().slice(0, 220),
            answerText: q.options[q.correctIndex]
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 220),
          })),
        },
      },
    });
  }

  private coerceAnswers(
    raw: CompleteBody["answers"],
  ): Record<string, number> {
    const out: Record<string, number> = {};
    if (!raw || typeof raw !== "object") return out;
    for (const [key, value] of Object.entries(raw)) {
      const n =
        typeof value === "number" && Number.isFinite(value) ?
          value
        : parseInt(String(value), 10);
      if (!Number.isFinite(n) || n < 0 || n > 3 || !`${key}`.trim()) continue;
      out[String(key)] = Math.trunc(n);
    }
    return out;
  }

  private async assertPhaseFinalTestPrerequisites(
    userId: number,
    phaseIndex: number,
    ctx: {
      plan: ReturnType<typeof parseStudyingPlanV2OrNull>;
      activeStudyingPhaseIndex: number;
    },
  ): Promise<void> {
    const phase = ctx.plan?.phases[phaseIndex];
    if (!phase) {
      throw new BadRequestException("Learning plan phase not found");
    }
    const progress = await loadPhaseAdvanceProgress(this.prisma, userId);
    const met = arePhaseFinalTestPrerequisitesMetForPhase({
      phase,
      phaseIndex,
      activePhaseIndex: ctx.activeStudyingPhaseIndex,
      progress,
    });
    if (!met) {
      throw new BadRequestException(
        "Complete all phase requirements before taking the final test",
      );
    }
  }

  private async loadUserPlanContext(userId: number): Promise<{
    userName: string;
    englishLevel: string;
    hobbies: string[];
    activeStudyingPhaseIndex: number;
    phaseCount: number;
    plan: ReturnType<typeof parseStudyingPlanV2OrNull>;
    phaseFinalTestDraft: unknown;
    phaseFinalTestProgress: unknown;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        additionalUserData: {
          select: {
            englishLevel: true,
            hobbies: true,
            studyingPlanPhases: true,
            activeStudyingPhaseIndex: true,
            phaseFinalTestDraft: true,
            phaseFinalTestProgress: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const extra = user.additionalUserData;
    const plan = parseStudyingPlanV2OrNull(extra?.studyingPlanPhases);
    const phaseCount = phaseCountFromStoredPhases(extra?.studyingPlanPhases, 4);
    const maxIdx = Math.max(0, phaseCount - 1);
    const activeStudyingPhaseIndex = Math.min(
      Math.max(0, extra?.activeStudyingPhaseIndex ?? 0),
      maxIdx,
    );
    return {
      userName: user.name?.trim() || "Learner",
      englishLevel: extra?.englishLevel?.trim() || "B1",
      hobbies: Array.isArray(extra?.hobbies) ? extra.hobbies : [],
      activeStudyingPhaseIndex,
      phaseCount,
      plan,
      phaseFinalTestDraft: extra?.phaseFinalTestDraft ?? null,
      phaseFinalTestProgress: extra?.phaseFinalTestProgress ?? null,
    };
  }
}
