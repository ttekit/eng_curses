import { phaseCountFromStoredStudyingPlanJson } from "../studying-plan/studying-plan-json.util";
import { DISTINCT_PASSED_LESSONS_PER_PHASE_STEP } from "../studying-plan/studying-plan.constants";

export { DISTINCT_PASSED_LESSONS_PER_PHASE_STEP };

export function phaseCountFromStoredPhases(
  studyingPlanPhases: unknown,
  fallback = 4,
): number {
  const n = phaseCountFromStoredStudyingPlanJson(studyingPlanPhases);
  if (n != null && n > 0) return n;
  return fallback;
}

/** 0-based index into the learner's phase list from distinct passed videos only. */
export function activeStudyingPhaseFromPassedLessons(
  distinctPassedLessonCount: number,
  phaseCount: number,
): number {
  if (phaseCount <= 1) return 0;
  const maxIdx = phaseCount - 1;
  return Math.min(
    Math.floor(
      Math.max(0, distinctPassedLessonCount) /
        DISTINCT_PASSED_LESSONS_PER_PHASE_STEP,
    ),
    maxIdx,
  );
}

/**
 * How many initial phases have a passed final test (0 = none, 1 = phase 0 test passed, …).
 */
export function phaseIndexUnlockedByFinalTests(
  passedPhaseIndices: readonly number[],
): number {
  const passed = new Set(
    passedPhaseIndices
      .map((n) => Math.floor(Number(n)))
      .filter((n) => Number.isFinite(n) && n >= 0),
  );
  let unlocked = 0;
  while (passed.has(unlocked)) {
    unlocked += 1;
  }
  return unlocked;
}

/** Combines video progress and passed phase final tests. */
export function activeStudyingPhaseIndexFromProgress(options: {
  distinctPassedLessonCount: number;
  passedFinalTestPhaseIndices: readonly number[];
  phaseCount: number;
}): number {
  const { distinctPassedLessonCount, passedFinalTestPhaseIndices, phaseCount } =
    options;
  if (phaseCount <= 1) return 0;
  const maxIdx = phaseCount - 1;
  const fromVideos = activeStudyingPhaseFromPassedLessons(
    distinctPassedLessonCount,
    phaseCount,
  );
  const fromTests = phaseIndexUnlockedByFinalTests(passedFinalTestPhaseIndices);
  return Math.min(fromVideos, fromTests, maxIdx);
}
