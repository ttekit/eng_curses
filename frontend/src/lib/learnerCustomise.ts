import type { UserData } from "../context/UserContext";

function stripChoosePlaceholder(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed === "choose" ? "" : trimmed;
}

/**
 * True when job, education, hobbies, and at least one genre preference are saved.
 */
export function learnerHasCompletedCustomise(
  user: UserData | null | undefined,
): boolean {
  if (!user) {
    return false;
  }
  const hasJob = stripChoosePlaceholder(user.workField).length > 0;
  const hasEducation = stripChoosePlaceholder(user.education).length > 0;
  const hasHobbies = user.hobbies.length > 0;
  const hasGenres =
    user.favoriteGenres.length > 0 || user.hatedGenres.length > 0;
  return hasJob && hasEducation && hasHobbies && hasGenres;
}

export function shouldShowLearnerCustomiseFab(
  user: UserData | null | undefined,
  pathname: string,
): boolean {
  if (!user || learnerHasCompletedCustomise(user)) {
    return false;
  }
  const role = user.role?.toLowerCase();
  if (role === "teacher" || role === "admin") {
    return false;
  }
  if (pathname === "/customise") {
    return false;
  }
  return true;
}
