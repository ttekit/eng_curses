import type { UserData } from "../types/user";

/**
 * Returns whether the learner may view 18+ catalog and lesson content.
 */
export function is_adult_user(user: UserData | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.role === "adult") {
    return true;
  }
  if (!user.dateOfBirth) {
    return false;
  }
  const dob = new Date(user.dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return false;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age >= 18;
}

export function is_age_restricted_locked(
  ageRestriction: string | undefined,
  user: UserData | null | undefined,
): boolean {
  const age = ageRestriction ?? "0+";
  if (age !== "18+" && age !== "21+") {
    return false;
  }
  return !is_adult_user(user);
}
