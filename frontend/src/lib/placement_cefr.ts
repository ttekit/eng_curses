export const ADULT_SKIP_PLACEMENT_TEST = "none" as const;

export const ADULT_PLACEMENT_CEFR_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

export type AdultPlacementCefrLevel =
  (typeof ADULT_PLACEMENT_CEFR_LEVELS)[number];

export const ADULT_PLACEMENT_CEFR_SET: ReadonlySet<string> = new Set(
  ADULT_PLACEMENT_CEFR_LEVELS,
);

export function parse_adult_profile_cefr_target(
  level: string | undefined,
): AdultPlacementCefrLevel | "" {
  const trimmed = level?.trim() ?? "";
  if (!trimmed) {
    return "";
  }
  const lowered = trimmed.toLowerCase();
  if (lowered === "choose") {
    return "";
  }
  const embedded = trimmed
    .match(/\b(A1|A2|B1|B2|C1|C2)\b/i)?.[1]
    ?.toUpperCase();
  if (embedded && ADULT_PLACEMENT_CEFR_SET.has(embedded)) {
    return embedded as AdultPlacementCefrLevel;
  }
  const upper = trimmed.toUpperCase();
  if (ADULT_PLACEMENT_CEFR_SET.has(upper)) {
    return upper as AdultPlacementCefrLevel;
  }
  if (/\bpre[-\s]?a1\b/i.test(trimmed)) {
    return "A1";
  }
  if (/\bbeginner|elementary|starter\b/i.test(lowered)) {
    return "A1";
  }
  if (/\ba2\b/i.test(lowered)) {
    return "A2";
  }
  if (/\bupper\s+intermediate\b/i.test(lowered)) {
    return "B2";
  }
  if (/\bb1\b/i.test(lowered)) {
    return "B1";
  }
  if (/\bintermediate\b/i.test(lowered)) {
    return "B1";
  }
  if (/\bb2\b/i.test(lowered)) {
    return "B2";
  }
  if (/\badvanced\b/i.test(lowered)) {
    return "C1";
  }
  if (/\bc1\b/i.test(lowered)) {
    return "C1";
  }
  if (/\bproficient|mastery\b/i.test(lowered)) {
    return "C2";
  }
  if (/\bc2\b/i.test(lowered)) {
    return "C2";
  }
  return "";
}

export function adult_needs_placement_cefr(user: {
  role: string;
  englishLevel: string;
}): boolean {
  if (user.role !== "adult") {
    return false;
  }
  return parse_adult_profile_cefr_target(user.englishLevel) === "";
}
