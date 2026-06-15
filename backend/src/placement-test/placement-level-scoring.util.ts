import type { PlacementStoredDraftQuestion } from "./placement-draft.types";
import {
  index_of_placement_cefr_code,
  placement_band_at_index,
  type PlacementLevelBand,
} from "./placement-band.constants";

/**
 * Entry test is confirmation-focused: questions target the learner’s declared band,
 * and we never promote above it from test scores alone.
 */
export function confirmed_placement_band_from_declared_and_score(
  scored: PlacementLevelBand,
  declared: PlacementLevelBand,
): PlacementLevelBand {
  const si = index_of_placement_cefr_code(scored.code);
  const di = index_of_placement_cefr_code(declared.code);
  if (si < 0 || di < 0) {
    return declared;
  }
  if (si >= di) {
    return declared;
  }
  const minAllowedIdx = Math.max(0, di - 1);
  const finalIdx = Math.max(si, minAllowedIdx);
  return placement_band_at_index(finalIdx);
}

/** `englishLevel` string stored without label (Algorythm `getBaseLevel` expects "A1"…"C2"). */
export function placement_band_from_score(
  score: number,
  total: number,
): PlacementLevelBand {
  if (total <= 0) {
    return { code: "B1", label: "Intermediate" };
  }
  const pct = (score / total) * 100;
  if (pct >= 90) return { code: "C1", label: "Advanced" };
  if (pct >= 70) return { code: "B2", label: "Upper intermediate" };
  if (pct >= 50) return { code: "B1", label: "Intermediate" };
  if (pct >= 30) return { code: "A2", label: "Elementary" };
  return { code: "A1", label: "Beginner" };
}

export function score_against_draft(
  draftRows: readonly { id: string; correctIndex: 0 | 1 | 2 | 3 }[],
  answers: Record<string, number>,
): { score: number; total: number } {
  let score = 0;
  const total = draftRows.length;
  for (const row of draftRows) {
    const pick = answers[row.id];
    if (pick === row.correctIndex) score++;
  }
  return { score, total };
}

/** Per-skill correctness for drafts that store `type` on each question. */
export function score_placement_by_skill(
  draftRows: readonly PlacementStoredDraftQuestion[],
  answers: Record<string, number>,
): {
  grammar: { c: number; t: number };
  vocabulary: { c: number; t: number };
  untyped: { c: number; t: number };
} {
  let gC = 0,
    gT = 0,
    vC = 0,
    vT = 0,
    uC = 0,
    uT = 0;
  for (const row of draftRows) {
    const pick = answers[row.id];
    const ok = typeof pick === "number" && pick === row.correctIndex;
    if (row.type === "grammar") {
      gT++;
      if (ok) gC++;
    } else if (row.type === "vocabulary") {
      vT++;
      if (ok) vC++;
    } else {
      uT++;
      if (ok) uC++;
    }
  }
  return {
    grammar: { c: gC, t: gT },
    vocabulary: { c: vC, t: vT },
    untyped: { c: uC, t: uT },
  };
}

/** @deprecated Use confirmed_placement_band_from_declared_and_score */
export const confirmedPlacementBandFromDeclaredAndScore =
  confirmed_placement_band_from_declared_and_score;

/** @deprecated Use placement_band_from_score */
export const placementBandFromScore = placement_band_from_score;

/** @deprecated Use score_against_draft */
export const scoreAgainstDraft = score_against_draft;

/** @deprecated Use score_placement_by_skill */
export const scorePlacementBySkill = score_placement_by_skill;
