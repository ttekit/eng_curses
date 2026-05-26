import { userEnglishLevelToCefrUnit } from "src/content-recommendations/content-recommendation.scoring";

const CEFR_LADDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function cefrIndexFromUnit(unit: number): number {
  if (unit <= 0.12) return 0;
  if (unit <= 0.22) return 1;
  if (unit <= 0.45) return 2;
  if (unit <= 0.65) return 3;
  if (unit <= 0.85) return 4;
  return 5;
}

function cefrIndexFromLabel(raw: string): number | null {
  const match = raw.trim().toUpperCase().match(/\b(PRE-A1|A1|A2|B1|B2|C1|C2)\b/);
  if (!match) {
    return null;
  }
  const label = match[1] === "PRE-A1" ? "A1" : match[1];
  const idx = CEFR_LADDER.indexOf(label as (typeof CEFR_LADDER)[number]);
  return idx >= 0 ? idx : null;
}

/**
 * Maps profile English level to a starting CEFR band index on the A1–C2 ladder.
 */
export function resolveStartCefrIndex(englishLevel: string): number {
  const fromLabel = cefrIndexFromLabel(englishLevel);
  if (fromLabel !== null) {
    return fromLabel;
  }
  return cefrIndexFromUnit(userEnglishLevelToCefrUnit(englishLevel));
}

/**
 * Expected CEFR band for a plan phase (ramps toward goal across ≥4 phases).
 */
export function expectedCefrLevelForPhase(
  englishLevel: string,
  phaseIndex: number,
  phaseCount: number,
): string {
  const startIdx = resolveStartCefrIndex(englishLevel);
  const targetIdx = Math.min(CEFR_LADDER.length - 1, startIdx + 2);
  if (phaseCount <= 1) {
    return CEFR_LADDER[startIdx];
  }
  const progress = phaseIndex / (phaseCount - 1);
  const idx = Math.round(startIdx + (targetIdx - startIdx) * progress);
  return CEFR_LADDER[Math.min(CEFR_LADDER.length - 1, Math.max(0, idx))];
}
