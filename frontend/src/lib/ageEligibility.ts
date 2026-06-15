import type { UserData } from "../context/UserContext";

const ADULT_MIN_AGE = 18;

function parseVideoMinAgeYears(ageRestriction: string | undefined): number {
  const raw = (ageRestriction ?? "0+").trim();
  const match = /^(\d+)\+/.exec(raw);
  if (!match) {
    return 0;
  }
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveUserAgeYears(user: UserData | null | undefined): number | null {
  if (!user) {
    return null;
  }
  if (user.role === "adult") {
    return ADULT_MIN_AGE;
  }
  if (!user.dateOfBirth?.trim()) {
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

export function isUserEligibleForVideoAge(
  user: UserData | null | undefined,
  ageRestriction: string | undefined,
): boolean {
  const requiredAge = parseVideoMinAgeYears(ageRestriction);
  if (requiredAge <= 0) {
    return true;
  }
  const userAge = resolveUserAgeYears(user);
  if (userAge === null) {
    return false;
  }
  return userAge >= requiredAge;
}
