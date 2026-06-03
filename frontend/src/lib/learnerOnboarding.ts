import type { UserData } from "../context/UserContext";
import {
  adultNeedsPlacementPrepFields,
  studentNeedsPlacementPreferencesOverlay,
} from "../components/PlacementPreTestStep";
import { userMayUseLearnerApp } from "./subscriptionAccess";

export type PlacementPhase = "preferences" | "test" | "off";

/**
 * Whether the learner still owes the entry placement test (teachers/admins exempt).
 */
export function learnerNeedsPlacement(user: UserData | null): boolean {
  if (!user) {
    return false;
  }
  if (user.role === "teacher" || user.role === "admin") {
    return false;
  }
  return !user.hasCompletedPlacement;
}

/**
 * Catalog overlay phase while placement is incomplete.
 */
export function resolvePlacementPhase(user: UserData): PlacementPhase {
  if (!learnerNeedsPlacement(user)) {
    return "off";
  }
  if (user.role === "adult") {
    return adultNeedsPlacementPrepFields(user) ? "preferences" : "test";
  }
  if (user.role === "student") {
    return studentNeedsPlacementPreferencesOverlay(user)
      ? "preferences"
      : "test";
  }
  const hasPrefs =
    (user.hobbies?.length ?? 0) > 0 &&
    (user.favoriteGenres?.length ?? 0) > 0;
  return hasPrefs ? "test" : "preferences";
}

/**
 * Post-login redirect before the SPA loads the target route.
 */
export function resolvePostLoginPath(
  profile: UserData | null,
  explicit?: string,
): string {
  if (!profile) {
    return "/subscribe";
  }

  if (profile.role === "admin") {
    return "/admin";
  }
  if (profile.role === "teacher") {
    return "/catalog";
  }

  if (
    !profile.role ||
    profile.role === "choose" ||
    profile.role === "regular"
  ) {
    return "/registrationDetails";
  }

  if (
    (!profile.favoriteGenres || profile.favoriteGenres.length === 0) &&
    (!profile.hatedGenres || profile.hatedGenres.length === 0)
  ) {
    return "/registrationPreferences";
  }

  if (
    profile.role === "student" &&
    profile.teacherId == null &&
    (!profile.education?.trim() ||
      !profile.workField?.trim() ||
      !profile.nativeLanguage?.trim())
  ) {
    return "/catalog";
  }

  if (
    !profile.englishLevel ||
    profile.englishLevel === "choose" ||
    profile.englishLevel === ""
  ) {
    return "/catalog";
  }

  if (!profile.hasCompletedPlacement) {
    return "/catalog";
  }

  if (explicit) {
    return explicit;
  }
  if (userMayUseLearnerApp(profile)) {
    return "/catalog";
  }

  return "/subscribe";
}
