/**
 * Placement onboarding field checks (from `PlacementPreTestStep.tsx`).
 */
import type { UserData } from "../types/user";

const ADULT_PLACEMENT_CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const ADULT_PLACEMENT_CEFR_SET: ReadonlySet<string> = new Set(ADULT_PLACEMENT_CEFR_LEVELS);

function parseAdultProfileCefrTarget(level: string | undefined): string {
  const trimmed = level?.trim() ?? "";
  if (!trimmed || trimmed.toLowerCase() === "choose") {
    return "";
  }
  const embedded = trimmed.match(/\b(A1|A2|B1|B2|C1|C2)\b/i)?.[1]?.toUpperCase();
  if (embedded && ADULT_PLACEMENT_CEFR_SET.has(embedded)) {
    return embedded;
  }
  const upper = trimmed.toUpperCase();
  if (ADULT_PLACEMENT_CEFR_SET.has(upper)) {
    return upper;
  }
  return "";
}

export function adultNeedsPlacementPrepFields(user: UserData): boolean {
  if (user.role !== "adult") {
    return false;
  }
  return (
    !user.workField?.trim() ||
    !user.education?.trim() ||
    !(user.hobbies && user.hobbies.length > 0) ||
    !user.nativeLanguage?.trim() ||
    !parseAdultProfileCefrTarget(user.englishLevel)
  );
}

export function studentNeedsPlacementPreferencesOverlay(user: UserData): boolean {
  if (user.role !== "student") {
    return false;
  }
  const hasGenres = (user.favoriteGenres?.length ?? 0) > 0;
  const hasHobbies = (user.hobbies?.length ?? 0) > 0;
  if (user.teacherId != null) {
    return !hasHobbies || !hasGenres;
  }
  return (
    !user.workField?.trim() ||
    !user.education?.trim() ||
    !user.nativeLanguage?.trim() ||
    !hasHobbies ||
    !hasGenres
  );
}
