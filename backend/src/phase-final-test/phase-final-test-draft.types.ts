import type { PlacementStoredDraftQuestion } from "../placement-test/placement-draft.types";

export const PHASE_FINAL_TEST_DRAFT_VERSION = 1 as const;

export type PhaseFinalTestStoredDraft = {
  readonly v: typeof PHASE_FINAL_TEST_DRAFT_VERSION;
  readonly phaseIndex: number;
  readonly issuedAt: string;
  readonly questions: PlacementStoredDraftQuestion[];
};

export function parsePhaseFinalTestDraft(
  raw: unknown,
): PhaseFinalTestStoredDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (
    record.v !== PHASE_FINAL_TEST_DRAFT_VERSION ||
    typeof record.issuedAt !== "string"
  ) {
    return null;
  }
  const phaseIndex = Number(record.phaseIndex);
  if (!Number.isFinite(phaseIndex) || phaseIndex < 0) return null;
  if (!Array.isArray(record.questions) || record.questions.length === 0) {
    return null;
  }
  const questions: PlacementStoredDraftQuestion[] = [];
  for (const row of record.questions) {
    if (!row || typeof row !== "object") return null;
    const item = row as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : null;
    const correctIndex = Number(item.correctIndex);
    if (!id || !Number.isFinite(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      return null;
    }
    questions.push({
      id,
      correctIndex: Math.floor(correctIndex) as 0 | 1 | 2 | 3,
      ...(item.type === "grammar" || item.type === "vocabulary" ?
        { type: item.type }
      : {}),
    });
  }
  return {
    v: PHASE_FINAL_TEST_DRAFT_VERSION,
    phaseIndex: Math.floor(phaseIndex),
    issuedAt: record.issuedAt,
    questions,
  };
}
