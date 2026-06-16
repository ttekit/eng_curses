import type { UserData } from "../context/UserContext";

export type VideoAgeAccess = "allowed" | "needs_dob" | "blocked";

export function parseVideoMinAgeYears(
  ageRestriction: string | undefined,
): number {
  const raw = (ageRestriction ?? "0+").trim();
  const match = /^(\d+)\+/.exec(raw);
  if (!match) {
    return 0;
  }
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isStaffUser(user: UserData | null | undefined): boolean {
  const role = user?.role?.toLowerCase();
  return role === "teacher" || role === "admin";
}

export function resolveUserAgeYears(
  user: UserData | null | undefined,
): number | null {
  if (!user?.dateOfBirth?.trim()) {
    return null;
  }
  const dob = new Date(user.dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function resolveVideoAgeAccess(
  user: UserData | null | undefined,
  ageRestriction: string | undefined,
): VideoAgeAccess {
  const requiredAge = parseVideoMinAgeYears(ageRestriction);
  if (requiredAge <= 0) {
    return "allowed";
  }
  if (isStaffUser(user)) {
    return "allowed";
  }
  if (!user?.dateOfBirth?.trim()) {
    return "needs_dob";
  }
  const userAge = resolveUserAgeYears(user);
  if (userAge === null) {
    return "needs_dob";
  }
  return userAge >= requiredAge ? "allowed" : "blocked";
}

export function isUserEligibleForVideoAge(
  user: UserData | null | undefined,
  ageRestriction: string | undefined,
): boolean {
  return resolveVideoAgeAccess(user, ageRestriction) === "allowed";
}
