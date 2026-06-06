/**
 * Post-login routing for the mobile learner app.
 */
import type { UserData } from "../types/user";
import {
  adultNeedsPlacementPrepFields,
  studentNeedsPlacementPreferencesOverlay,
} from "./placementHelpers";
import { userMayUseLearnerApp } from "./subscriptionAccess";
import type { AppRouteName } from "../navigation/types";

export function learnerNeedsPlacement(user: UserData | null): boolean {
  if (!user) {
    return false;
  }
  if (user.role === "teacher" || user.role === "admin") {
    return false;
  }
  return !user.hasCompletedPlacement;
}

export function resolvePostLoginRoute(profile: UserData | null): AppRouteName {
  if (!profile) {
    return "Subscribe";
  }
  if (profile.role === "admin" || profile.role === "teacher") {
    return "MainTabs";
  }
  if (
    !profile.role ||
    profile.role === "choose" ||
    profile.role === "regular"
  ) {
    return "Subscribe";
  }
  if (!userMayUseLearnerApp(profile)) {
    return "Subscribe";
  }
  return "MainTabs";
}

export function resolvePlacementPhase(
  user: UserData,
): "preferences" | "test" | "off" {
  if (!learnerNeedsPlacement(user)) {
    return "off";
  }
  if (user.role === "adult") {
    return adultNeedsPlacementPrepFields(user) ? "preferences" : "test";
  }
  if (user.role === "student") {
    return studentNeedsPlacementPreferencesOverlay(user) ? "preferences" : "test";
  }
  const hasPrefs =
    (user.hobbies?.length ?? 0) > 0 && (user.favoriteGenres?.length ?? 0) > 0;
  return hasPrefs ? "test" : "preferences";
}
