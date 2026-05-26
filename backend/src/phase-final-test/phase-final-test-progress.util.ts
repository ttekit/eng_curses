export type PhaseFinalTestProgress = {
  passedPhaseIndices: number[];
};

export function parsePhaseFinalTestProgress(
  raw: unknown,
): PhaseFinalTestProgress {
  if (!raw || typeof raw !== "object") {
    return { passedPhaseIndices: [] };
  }
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.passedPhaseIndices)) {
    return { passedPhaseIndices: [] };
  }
  const passedPhaseIndices = [
    ...new Set(
      record.passedPhaseIndices
        .map((value) => Math.floor(Number(value)))
        .filter((value) => Number.isFinite(value) && value >= 0),
    ),
  ].sort((a, b) => a - b);
  return { passedPhaseIndices };
}

export function hasPassedPhaseFinalTest(
  progress: PhaseFinalTestProgress,
  phaseIndex: number,
): boolean {
  return progress.passedPhaseIndices.includes(phaseIndex);
}

export function markPhaseFinalTestPassed(
  progress: PhaseFinalTestProgress,
  phaseIndex: number,
): PhaseFinalTestProgress {
  const idx = Math.floor(phaseIndex);
  if (idx < 0 || progress.passedPhaseIndices.includes(idx)) {
    return progress;
  }
  return {
    passedPhaseIndices: [...progress.passedPhaseIndices, idx].sort(
      (a, b) => a - b,
    ),
  };
}
