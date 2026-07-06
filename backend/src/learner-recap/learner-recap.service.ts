import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { webVttToPlainText } from "src/contents/webvtt-to-plain-text.util";
import type { ComprehensionTestItem } from "src/content-video/content-video-comprehension-tests-gemini.client";
import type { PriorWeakSpot } from "src/content-video/content-video-comprehension-tests-gemini.client";
import {
  scoreMcqBuckets,
  totalCorrectAndQuestions,
  type GradingItem,
} from "src/content-video/content-video-test-grade.util";
import {
  effectiveLearningGoal,
  effectiveTimeHorizon,
} from "src/content-video/studying-plan.util";
import {
  formatUtcMonthKey,
  formatUtcWeekStartDate,
  getUtcCalendarMonthRange,
  getUtcMondayWeekRange,
} from "src/datetime/utc-period.util";
import { PrismaService } from "src/prisma.service";
import { UserVocabularyService } from "src/user-vocabulary/user-vocabulary.service";
import {
  fallbackRecapTests,
  LEARNER_RECAP_MCQ_COUNT,
} from "./learner-recap-fallback.tests";
import { LearnerRecapGeminiClient } from "./learner-recap-gemini.client";
import {
  createRecapGradingToken,
  parseRecapGradingToken,
  type RecapKind,
} from "./recap-grading-token.util";

const GRADING_TTL_MS = 2 * 60 * 60 * 1000;
const MISTAKES_COOLDOWN_MS = 30 * 60 * 1000;
const MAX_TRANSCRIPT_CHARS = 14_000;

export type RecapStatusItem = {
  kind: RecapKind;
  available: boolean;
  completedInPeriod: boolean;
  nextAvailableAt: string | null;
  lastScorePct: number | null;
  lessonCount: number;
  reason: string | null;
};

export type LearnerRecapStatusResponse = {
  mistakes: RecapStatusItem;
  weekly: RecapStatusItem;
  monthly: RecapStatusItem;
};

export type GenerateRecapResponse = {
  kind: RecapKind;
  source: "gemini" | "fallback";
  recapLabel: string;
  tests: ComprehensionTestItem[];
  gradingToken: string;
  lessonTitles: string[];
};

export type SubmitRecapResponse = {
  kind: RecapKind;
  correct: number;
  total: number;
  percentage: number;
  message: string;
};

export type RecapReasonCode =
  | "NEED_LESSONS_FOR_MISTAKES"
  | "WEEKLY_ALREADY_COMPLETED"
  | "NEED_LESSONS_FOR_WEEKLY"
  | "MONTHLY_ALREADY_COMPLETED"
  | "NEED_LESSONS_FOR_MONTHLY";

@Injectable()
export class LearnerRecapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly gemini: LearnerRecapGeminiClient,
    private readonly userVocabulary: UserVocabularyService,
  ) { }

  async getStatus(userId: number): Promise<LearnerRecapStatusResponse> {
    const user = await this.loadUserRecapFields(userId);
    const [mistakesCtx, weeklyCtx, monthlyCtx] = await Promise.all([
      this.buildMistakesContext(userId),
      this.buildPeriodContext(userId, "weekly"),
      this.buildPeriodContext(userId, "monthly"),
    ]);
    const now = Date.now();
    const mistakesNext = this.mistakesNextAvailableAt(
      user.mistakesPracticeCompletedAt,
      now,
    );
    const weekKey = formatUtcWeekStartDate(new Date());
    const monthKey = formatUtcMonthKey(new Date());
    const mistakes: RecapStatusItem = {
      kind: "mistakes",
      lessonCount: mistakesCtx.lessonCount,
      completedInPeriod: false,
      available:
        mistakesCtx.eligible &&
        (mistakesNext === null || mistakesNext.getTime() <= now),
      nextAvailableAt: mistakesNext?.toISOString() ?? null,
      lastScorePct: null,
      reason: mistakesCtx.eligible ? null : "NEED_LESSONS_FOR_MISTAKES",
    };
    const weeklyCompleted = user.weeklyReviewCompletedWeekStart === weekKey;
    const weekly: RecapStatusItem = {
      kind: "weekly",
      lessonCount: weeklyCtx.lessonCount,
      completedInPeriod: weeklyCompleted,
      available: weeklyCtx.eligible && !weeklyCompleted,
      nextAvailableAt: weeklyCompleted
        ? this.nextUtcMonday().toISOString()
        : null,
      lastScorePct: user.weeklyReviewLastScorePct ?? null,
      reason: weeklyCtx.eligible
        ? weeklyCompleted
          ? "WEEKLY_ALREADY_COMPLETED"
          : null
        : "NEED_LESSONS_FOR_WEEKLY",
    };
    const monthlyCompleted = user.monthlyReviewCompletedMonth === monthKey;
    const monthly: RecapStatusItem = {
      kind: "monthly",
      lessonCount: monthlyCtx.lessonCount,
      completedInPeriod: monthlyCompleted,
      available: monthlyCtx.eligible && !monthlyCompleted,
      nextAvailableAt: monthlyCompleted
        ? this.nextUtcMonthStart().toISOString()
        : null,
      lastScorePct: user.monthlyReviewLastScorePct ?? null,
      reason: monthlyCtx.eligible
        ? monthlyCompleted
          ? "MONTHLY_ALREADY_COMPLETED"
          : null
        : "NEED_LESSONS_FOR_MONTHLY",
    };
    return { mistakes, weekly, monthly };
  }

  async generate(
    userId: number,
    kind: RecapKind,
  ): Promise<GenerateRecapResponse> {
    const status = await this.getStatus(userId);
    const item = status[kind];
    if (!item.available) {
      throw new ForbiddenException(item.reason ?? "Recap not available");
    }
    const ctx =
      kind === "mistakes"
        ? await this.buildMistakesContext(userId)
        : await this.buildPeriodContext(userId, kind);
    const recapLabel =
      kind === "mistakes"
        ? "Work on mistakes"
        : kind === "weekly"
          ? "Weekly summary"
          : "Monthly summary";
    const learner = await this.loadLearnerContext(userId);
    const geminiTests = await this.gemini.generateRecapTests({
      kind,
      recapLabel,
      lessonTitles: ctx.lessonTitles,
      combinedTranscript: ctx.combinedTranscript,
      learnerCefr: learner.cefr,
      vocabularyTerms: learner.vocabularyTerms,
      priorWeakSpots: ctx.priorWeakSpots,
      learningGoal: learner.learningGoal,
      timeToAchieve: learner.timeToAchieve,
      hobbies: learner.hobbies,
    });
    const source =
      geminiTests && geminiTests.length >= 6 ? "gemini" : "fallback";
    const tests =
      source === "gemini"
        ? geminiTests!
        : fallbackRecapTests({
          recapLabel,
          lessonTitles: ctx.lessonTitles,
          priorWeakSpots: ctx.priorWeakSpots,
        });
    const secret = this.config.getOrThrow<string>("JWT_SECRET");
    const exp = Date.now() + GRADING_TTL_MS;
    const items: GradingItem[] = tests
      .filter(
        (
          t,
        ): t is Extract<
          ComprehensionTestItem,
          { questionType: "multiple_choice" }
        > => t.questionType === "multiple_choice",
      )
      .map((t) => ({
        kind: "mcq" as const,
        id: t.id,
        correctIndex: t.correctIndex,
        category: t.category,
        questionStem: t.question.slice(0, 400),
      }));
    const gradingToken = createRecapGradingToken(
      { kind, exp, userId, items },
      secret,
    );
    return {
      kind,
      source,
      recapLabel,
      tests: tests.slice(0, LEARNER_RECAP_MCQ_COUNT),
      gradingToken,
      lessonTitles: ctx.lessonTitles,
    };
  }

  async submit(
    userId: number,
    kind: RecapKind,
    body: { token: string; answers: Record<string, number> },
  ): Promise<SubmitRecapResponse> {
    const secret = this.config.getOrThrow<string>("JWT_SECRET");
    const p = parseRecapGradingToken((body?.token ?? "").trim(), secret);
    if (!p || p.userId !== userId || p.kind !== kind) {
      throw new BadRequestException("Invalid or expired recap token");
    }
    const numericAnswers: Record<string, number> = {};
    for (const [k, v] of Object.entries(body?.answers ?? {})) {
      if (typeof v === "number" && Number.isFinite(v)) {
        numericAnswers[k] = Math.floor(v);
      }
    }
    const buckets = scoreMcqBuckets(p.items, numericAnswers);
    const { correct, total } = totalCorrectAndQuestions(buckets);
    const pct = total > 0 ? correct / total : 0;
    const scorePct = Math.round(1000 * pct) / 10;
    const now = new Date();
    if (kind === "mistakes") {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mistakesPracticeCompletedAt: now,
          errorFixingTestPending: false,
        },
      });
    } else if (kind === "weekly") {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          weeklyReviewCompletedWeekStart: formatUtcWeekStartDate(now),
          weeklyReviewLastScorePct: scorePct,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          monthlyReviewCompletedMonth: formatUtcMonthKey(now),
          monthlyReviewLastScorePct: scorePct,
        },
      });
    }
    return {
      kind,
      correct,
      total,
      percentage: scorePct,
      message: `Saved your ${kind} recap score (${scorePct}%).`,
    };
  }

  private mistakesNextAvailableAt(
    last: Date | null,
    nowMs: number,
  ): Date | null {
    if (!last) {
      return null;
    }
    const next = last.getTime() + MISTAKES_COOLDOWN_MS;
    if (next <= nowMs) {
      return null;
    }
    return new Date(next);
  }

  private nextUtcMonday(): Date {
    const { weekEndExclusive } = getUtcMondayWeekRange();
    return weekEndExclusive;
  }

  private nextUtcMonthStart(): Date {
    const { monthEndExclusive } = getUtcCalendarMonthRange();
    return monthEndExclusive;
  }

  private async loadUserRecapFields(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        mistakesPracticeCompletedAt: true,
        weeklyReviewCompletedWeekStart: true,
        weeklyReviewLastScorePct: true,
        monthlyReviewCompletedMonth: true,
        monthlyReviewLastScorePct: true,
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  private async buildMistakesContext(userId: number): Promise<{
    lessonCount: number;
    lessonTitles: string[];
    combinedTranscript: string;
    priorWeakSpots: PriorWeakSpot[];
    eligible: boolean;
  }> {
    const weakRows = await this.prisma.userComprehensionWeakSpot.findMany({
      where: { userId },
      orderBy: [{ missCount: "desc" }, { lastMissedAt: "desc" }],
      take: 20,
      select: {
        category: true,
        stemSnippet: true,
        missCount: true,
        contentVideoId: true,
      },
    });
    const priorWeakSpots: PriorWeakSpot[] = weakRows.map((r) => ({
      category: r.category,
      stemSnippet: r.stemSnippet,
      missCount: r.missCount,
    }));
    const videoIds = [...new Set(weakRows.map((r) => r.contentVideoId))].slice(
      0,
      8,
    );
    const { lessonTitles, combinedTranscript } =
      await this.loadLessonBundle(videoIds);
    const attemptCount = await this.prisma.comprehensionTestAttempt.count({
      where: { userId },
    });
    const eligible = priorWeakSpots.length > 0 || attemptCount > 0;
    return {
      lessonCount: videoIds.length,
      lessonTitles,
      combinedTranscript,
      priorWeakSpots,
      eligible,
    };
  }

  private async buildPeriodContext(
    userId: number,
    period: "weekly" | "monthly",
  ): Promise<{
    lessonCount: number;
    lessonTitles: string[];
    combinedTranscript: string;
    priorWeakSpots: PriorWeakSpot[];
    eligible: boolean;
  }> {
    const range =
      period === "weekly"
        ? getUtcMondayWeekRange()
        : getUtcCalendarMonthRange();
    const start =
      period === "weekly"
        ? (range as ReturnType<typeof getUtcMondayWeekRange>).weekStart
        : (range as ReturnType<typeof getUtcCalendarMonthRange>).monthStart;
    const end =
      period === "weekly"
        ? (range as ReturnType<typeof getUtcMondayWeekRange>).weekEndExclusive
        : (range as ReturnType<typeof getUtcCalendarMonthRange>)
          .monthEndExclusive;
    const sessions = await this.prisma.watchSession.findMany({
      where: {
        userId,
        endedAt: { gte: start, lt: end },
      },
      select: { contentVideoId: true },
      distinct: ["contentVideoId"],
    });
    const videoIds = sessions.map((s) => s.contentVideoId);
    const { lessonTitles, combinedTranscript } =
      await this.loadLessonBundle(videoIds);
    const weakRows = await this.prisma.userComprehensionWeakSpot.findMany({
      where: { userId, contentVideoId: { in: videoIds } },
      orderBy: [{ missCount: "desc" }, { lastMissedAt: "desc" }],
      take: 12,
      select: { category: true, stemSnippet: true, missCount: true },
    });
    const priorWeakSpots: PriorWeakSpot[] = weakRows.map((r) => ({
      category: r.category,
      stemSnippet: r.stemSnippet,
      missCount: r.missCount,
    }));
    return {
      lessonCount: videoIds.length,
      lessonTitles,
      combinedTranscript,
      priorWeakSpots,
      eligible: videoIds.length > 0,
    };
  }

  private async loadLessonBundle(videoIds: number[]): Promise<{
    lessonTitles: string[];
    combinedTranscript: string;
  }> {
    if (videoIds.length === 0) {
      return { lessonTitles: [], combinedTranscript: "" };
    }
    const videos = await this.prisma.contentVideo.findMany({
      where: { id: { in: videoIds } },
      select: {
        videoName: true,
        videoCaption: { select: { subtitlesFileLink: true } },
      },
    });
    const lessonTitles = videos.map((v) => v.videoName).filter(Boolean);
    const chunks: string[] = [];
    let total = 0;
    for (const v of videos) {
      const link = v.videoCaption?.subtitlesFileLink;
      if (!link || total >= MAX_TRANSCRIPT_CHARS) continue;
      const plain = await this.fetchTranscriptPlain(link);
      if (!plain) continue;
      const piece = `### ${v.videoName}\n${plain}`;
      const room = MAX_TRANSCRIPT_CHARS - total;
      const slice = piece.slice(0, room);
      chunks.push(slice);
      total += slice.length;
    }
    return { lessonTitles, combinedTranscript: chunks.join("\n\n") };
  }

  private async fetchTranscriptPlain(link: string): Promise<string | null> {
    try {
      const res = await fetch(link);
      if (!res.ok) return null;
      const vtt = await res.text();
      const plain = webVttToPlainText(vtt);
      return plain.trim().length >= 40 ? plain : null;
    } catch {
      return null;
    }
  }

  private async loadLearnerContext(userId: number): Promise<{
    cefr: string | null;
    vocabularyTerms: string[];
    learningGoal: string;
    timeToAchieve: string;
    hobbies: string[];
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        additionalUserData: {
          select: {
            englishLevel: true,
            learningGoal: true,
            timeToAchieve: true,
            hobbies: true,
          },
        },
      },
    });
    const extra = user?.additionalUserData;
    const lang = await this.userVocabulary.getStudyingLanguageCode(userId);
    const vocabRows = await this.prisma.userVocabulary.findMany({
      where: { userId, language: lang },
      orderBy: { mastery: "desc" },
      take: 50,
      select: { term: true },
    });
    const vocabularyTerms = [
      ...new Set(
        vocabRows.map((r) => r.term.trim()).filter((t) => t.length > 0),
      ),
    ];
    return {
      cefr: extra?.englishLevel?.trim() || null,
      vocabularyTerms,
      learningGoal: effectiveLearningGoal(extra?.learningGoal),
      timeToAchieve: effectiveTimeHorizon(extra?.timeToAchieve),
      hobbies: extra?.hobbies ?? [],
    };
  }
}