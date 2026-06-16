import { UserRole } from "@generated/prisma/enums";

const ADULT_MIN_AGE = 18;

export function parseVideoMinAgeYears(
  ageRestriction: string | null | undefined,
): number {
  const raw = (ageRestriction ?? "0+").trim();
  const match = /^(\d+)\+/.exec(raw);
  if (!match) {
    return 0;
  }
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveUserAgeYears(input: {
  dateOfBirth: Date | null;
  role: UserRole | string | null;
}): number | null {
  if (input.role === UserRole.ADULT || input.role === "adult") {
    return ADULT_MIN_AGE;
  }
  if (!input.dateOfBirth) {
    return null;
  }
  const dob = input.dateOfBirth;
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
  userAgeYears: number | null,
  ageRestriction: string | null | undefined,
): boolean {
  const requiredAge = parseVideoMinAgeYears(ageRestriction);
  if (requiredAge <= 0) {
    return true;
  }
  if (userAgeYears === null) {
    return false;
  }
  return userAgeYears >= requiredAge;
}
