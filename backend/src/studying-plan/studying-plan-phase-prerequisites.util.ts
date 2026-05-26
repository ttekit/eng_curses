import { PrismaService } from "src/prisma.service";
import { DISTINCT_PASSED_LESSONS_PER_PHASE_STEP } from "./studying-plan.constants";
import type { StoredStudyingPlanPhaseV2 } from "./studying-plan-json.util";

/** Keep in sync with frontend `StudyingPlanAdvanceProgress`. */
export type PhaseAdvanceProgress = {
  distinctPassedVideos: number;
  vocabularyTermsTotal: number;
  currentStreak: number;
};

type PassConditionKind =
  | "advance_videos"
  | "depth_videos"
  | "finish_lesson"
  | "streak"
  | "vocabulary"
  | "topics"
  | "final_test"
  | "goal"
  | "performance"
  | "other";

function shouldHideCalendarSpanPassConditionLine(line: string): boolean {
  const t = line.trim();
  if (/plan on \*\*at least/i.test(t) || /\bplan on\s+\*\*at least/i.test(t)) {
    return true;
  }
  if (/structured window/i.test(t)) return true;
  if (/across all four phases/i.test(t) && /90%/i.test(t)) return true;
  if (/stated horizon/i.test(t) && /90%/i.test(t) && /\b(full|roadmap)\b/i.test(t)) {
    return true;
  }
  if (/minimum\s+(calendar|phase)\s+(span|duration)/i.test(t)) return true;
  if (
    /\bin this phase\b/i.test(t) &&
    /(\d+\s*\*\*)?\s*weeks?\s*\(/i.test(t) &&
    /goal horizon/i.test(t)
  ) {
    return true;
  }
  return false;
}

function passConditionsForDisplay(lines: string[]): string[] {
  return lines.filter(
    (line) =>
      !shouldHideCalendarSpanPassConditionLine(line) &&
      !shouldHideSoftTransitionPassConditionLine(line),
  );
}

function shouldHideSoftTransitionPassConditionLine(line: string): boolean {
  const t = line.trim().toLowerCase();
  if (
    /keep clip|choose clip|clip and quiz|aligned with your goal|choose clips aligned/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/підбирай кліп|обирай кліп|відповідали меті|вікторини так/i.test(t)) {
    return true;
  }
  if (/use english toward your goal|perform consistently|apply phase topics/i.test(t)) {
    return true;
  }
  if (/застосов.*тем|стабільно.*перевір|англійськ.*мет/i.test(t)) {
    return true;
  }
  return false;
}

function normalizeTransitionChecklistLines(phase: StoredStudyingPlanPhaseV2): string[] {
  const source =
    phase.passConditions && phase.passConditions.length > 0 ?
      phase.passConditions
    : phase.transitionCondition?.trim() ?
      [phase.transitionCondition.trim()]
    : [];
  let lines = passConditionsForDisplay(source);
  if (lines.length === 1 && lines[0].length > 160) {
    lines = lines[0]
      .split(/(?<=[.!?])\s+(?=[A-Z*«])/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return lines;
}

function parseFirstIntFromText(text: string): number | null {
  const match = text.match(/(\d+)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function extractDepthTargetFromLine(line: string): number | null {
  const depthMatch = line.match(/depth target\s+\*\*(\d+)\*\*/i);
  if (depthMatch) return Number(depthMatch[1]);
  const ukDepthMatch = line.match(/орієнтир\s+глибини[^*]*\*\*(\d+)\*\*/i);
  if (ukDepthMatch) return Number(ukDepthMatch[1]);
  const atLeastMatch = line.match(/at least\s+\*\*(\d+)\*\*/i);
  if (atLeastMatch) return Number(atLeastMatch[1]);
  const ukAtLeastMatch = line.match(/щонайменше\s+\*\*(\d+)\*\*/i);
  if (ukAtLeastMatch) return Number(ukAtLeastMatch[1]);
  return null;
}

function classifyPassConditionLine(line: string): PassConditionKind {
  const trimmed = line.trim();
  const text = trimmed.toLowerCase();
  if (/^pass \*\*\d+ distinct\*\*/i.test(trimmed)) {
    return "advance_videos";
  }
  if (/phase final test|підсумков|фінальн|ітогов/i.test(text)) {
    return "final_test";
  }
  if (/finish the full lesson|завершуй повний урок/i.test(text)) {
    return "finish_lesson";
  }
  if (
    /depth target|орієнтир глибини/i.test(text) ||
    (/at least|щонайменше/i.test(text) &&
      /distinct|різних\s+відео/i.test(text))
  ) {
    return "depth_videos";
  }
  if (
    /pass \*\*\d+ distinct\*\*/i.test(line) ||
    /comprehension checks at 70/i.test(text) ||
    /перевірки розуміння.*різних відео/i.test(text)
  ) {
    return "advance_videos";
  }
  if (/streak|сері/i.test(text)) return "streak";
  if (/words|vocab|слів|лексик/i.test(text)) return "vocabulary";
  if (/meaningful progress|прогрес.*тем|topics:/i.test(text)) {
    return "topics";
  }
  if (/aligned with your goal|toward your goal|відповідали меті|під мет/i.test(text)) {
    return "goal";
  }
  if (/perform consistently|apply phase topics|стабільно|застосов/i.test(text)) {
    return "performance";
  }
  return "other";
}

function isGatingPassConditionKind(kind: PassConditionKind): boolean {
  return (
    kind !== "final_test" &&
    kind !== "goal" &&
    kind !== "performance" &&
    kind !== "other"
  );
}

function streakTargetFromPhaseTasks(phase: StoredStudyingPlanPhaseV2): number | null {
  const task = phase.tasks.find((item) => item.kind === "streak_days");
  return task?.kind === "streak_days" ? task.minConsecutive : null;
}

function vocabularyTargetFromPhaseTasks(phase: StoredStudyingPlanPhaseV2): number | null {
  const task = phase.tasks.find((item) => item.kind === "vocabulary_terms_added");
  return task?.kind === "vocabulary_terms_added" ? task.minCount : null;
}

function videoDepthTargetFromPhaseTasks(phase: StoredStudyingPlanPhaseV2): number | null {
  const task = phase.tasks.find((item) => item.kind === "distinct_videos_passed");
  return task?.kind === "distinct_videos_passed" ? task.minCount : null;
}

function phaseStepVideoTarget(phaseIndex: number): number {
  return (phaseIndex + 1) * DISTINCT_PASSED_LESSONS_PER_PHASE_STEP;
}

function isPassConditionCompleted(options: {
  kind: PassConditionKind;
  phaseIndex: number;
  line: string;
  phase: StoredStudyingPlanPhaseV2;
  activePhaseIndex: number;
  progress: PhaseAdvanceProgress;
}): boolean {
  const { kind, phaseIndex, line, phase, activePhaseIndex, progress } = options;
  if (phaseIndex < activePhaseIndex) return true;
  if (phaseIndex > activePhaseIndex) return false;

  const stepVideos = phaseStepVideoTarget(phaseIndex);
  switch (kind) {
    case "advance_videos":
      return progress.distinctPassedVideos >= stepVideos;
    case "depth_videos": {
      const depthTarget =
        extractDepthTargetFromLine(line) ??
        videoDepthTargetFromPhaseTasks(phase) ??
        stepVideos;
      return progress.distinctPassedVideos >= depthTarget;
    }
    case "finish_lesson":
      return progress.distinctPassedVideos >= stepVideos;
    case "streak": {
      const target =
        streakTargetFromPhaseTasks(phase) ?? parseFirstIntFromText(line) ?? 1;
      return progress.currentStreak >= target;
    }
    case "vocabulary": {
      const target =
        vocabularyTargetFromPhaseTasks(phase) ??
        parseFirstIntFromText(line) ??
        Number.MAX_SAFE_INTEGER;
      return progress.vocabularyTermsTotal >= target;
    }
    case "final_test":
      return false;
    case "topics":
      return progress.distinctPassedVideos >= Math.max(1, stepVideos - 1);
    case "goal":
    case "performance":
    case "other":
      return false;
  }
}

/** Loads live metrics for phase transition checks. */
export async function loadPhaseAdvanceProgress(
  prisma: PrismaService,
  userId: number,
): Promise<PhaseAdvanceProgress> {
  const [distinctPassedVideos, vocabularyTermsTotal, user] = await Promise.all([
    prisma.comprehensionTestAttempt
      .findMany({
        where: { userId, passed: true },
        distinct: ["contentVideoId"],
        select: { contentVideoId: true },
      })
      .then((rows) => rows.length),
    prisma.userVocabulary.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    }),
  ]);
  return {
    distinctPassedVideos,
    vocabularyTermsTotal,
    currentStreak: user?.currentStreak ?? 0,
  };
}

/**
 * True when every measurable prerequisite is done (excludes final-test line).
 * Keep in sync with frontend `arePhaseFinalTestPrerequisitesMet`.
 */
export function arePhaseFinalTestPrerequisitesMetForPhase(options: {
  phase: StoredStudyingPlanPhaseV2;
  phaseIndex: number;
  activePhaseIndex: number;
  progress: PhaseAdvanceProgress;
}): boolean {
  const lines = normalizeTransitionChecklistLines(options.phase);
  const gatingLines = lines.filter((line) =>
    isGatingPassConditionKind(classifyPassConditionLine(line)),
  );
  if (gatingLines.length === 0) {
    return true;
  }
  return gatingLines.every((line) =>
    isPassConditionCompleted({
      kind: classifyPassConditionLine(line),
      phaseIndex: options.phaseIndex,
      line,
      phase: options.phase,
      activePhaseIndex: options.activePhaseIndex,
      progress: options.progress,
    }),
  );
}
