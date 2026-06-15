/** CEFR band from placement score — same thresholds as the placement-test iframe UI. */

export type PlacementLevelBand = {
  code: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  label: string;
};

/** Monotonic CEFR ladder for clamping placement outcomes to the learner’s declared band. */
export const PLACEMENT_CEFR_ORDER = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type PlacementCefrCode = (typeof PLACEMENT_CEFR_ORDER)[number];

export const PLACEMENT_BAND_LABELS: Record<PlacementCefrCode, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

export function placement_band_at_index(index: number): PlacementLevelBand {
  const idx = Math.min(
    PLACEMENT_CEFR_ORDER.length - 1,
    Math.max(0, Math.round(index)),
  );
  const code = PLACEMENT_CEFR_ORDER[idx];
  return { code, label: PLACEMENT_BAND_LABELS[code] };
}

export function index_of_placement_cefr_code(
  code: PlacementLevelBand["code"],
): number {
  return PLACEMENT_CEFR_ORDER.indexOf(code as PlacementCefrCode);
}

export function placement_band_from_code(code: PlacementCefrCode): PlacementLevelBand {
  return { code, label: PLACEMENT_BAND_LABELS[code] };
}

/** @deprecated Use placement_band_at_index */
export const placementBandAtIndex = placement_band_at_index;

/** @deprecated Use index_of_placement_cefr_code */
export const indexOfPlacementCefrCode = index_of_placement_cefr_code;
