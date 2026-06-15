import {
  PLACEMENT_CEFR_ORDER,
  placement_band_from_code,
  type PlacementCefrCode,
  type PlacementLevelBand,
} from "./placement-band.constants";

/**
 * Best-effort parse of already-persisted `englishLevel` (self-report or prior completion).
 */
export function infer_placement_band_from_profile(
  raw: string | null | undefined,
): PlacementLevelBand {
  const full = String(raw ?? "").trim();
  if (!full) {
    return placement_band_from_code("B1");
  }
  const lowered = full.toLowerCase();
  if (lowered === "choose") {
    return placement_band_from_code("B1");
  }
  const embedded = full.match(/\b(A1|A2|B1|B2|C1|C2)\b/i)?.[1]?.toUpperCase();
  if (
    embedded &&
    (PLACEMENT_CEFR_ORDER as readonly string[]).includes(embedded)
  ) {
    return placement_band_from_code(embedded as PlacementCefrCode);
  }
  const upperFull = full.toUpperCase();
  if ((PLACEMENT_CEFR_ORDER as readonly string[]).includes(upperFull)) {
    return placement_band_from_code(upperFull as PlacementCefrCode);
  }
  if (/\bpre[-\s]?a1\b/i.test(full)) {
    return placement_band_from_code("A1");
  }
  if (/\bbeginner|elementary|starter\b/i.test(lowered)) {
    return placement_band_from_code("A1");
  }
  if (/\ba2\b/i.test(lowered)) {
    return placement_band_from_code("A2");
  }
  if (/\bupper\s+intermediate\b/i.test(lowered)) {
    return placement_band_from_code("B2");
  }
  if (/\bb1\b/i.test(lowered)) {
    return placement_band_from_code("B1");
  }
  if (/\bintermediate\b/i.test(lowered)) {
    return placement_band_from_code("B1");
  }
  if (/\bb2\b/i.test(lowered)) {
    return placement_band_from_code("B2");
  }
  if (/\badvanced\b/i.test(lowered)) {
    return placement_band_from_code("C1");
  }
  if (/\bc1\b/i.test(lowered)) {
    return placement_band_from_code("C1");
  }
  if (/\bproficient|mastery\b/i.test(lowered)) {
    return placement_band_from_code("C2");
  }
  if (/\bc2\b/i.test(lowered)) {
    return placement_band_from_code("C2");
  }
  const head = upperFull.slice(0, 8);
  const m = head.match(/^(A1|A2|B1|B2|C1|C2)\b/)?.[1];
  if (m && m !== "CHOOSE" && m !== "UNKNOWN") {
    return placement_band_from_code(m as PlacementCefrCode);
  }
  return placement_band_from_code("B1");
}

/** @deprecated Use infer_placement_band_from_profile */
export const inferPlacementBandFromProfile = infer_placement_band_from_profile;
