import { apiFetch, readApiErrorBody } from "./api";

const MIN_AGE_YEARS = 13;

/** Validates YYYY-MM-DD and returns a user-facing error or `null` when valid. */
export function validateDateOfBirthInput(value: string): string | null {
  if (!value.trim()) {
    return "Date of birth is required";
  }
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) {
    return "Invalid date format";
  }
  if (birthDate.getFullYear() < 1900) {
    return "Please enter a valid year (1900 or later).";
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  if (age < MIN_AGE_YEARS) {
    return "You must be at least 13 years old.";
  }
  return null;
}

export async function saveUserDateOfBirth(dateOfBirth: string): Promise<void> {
  const response = await apiFetch("/users/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dateOfBirth }),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorBody(response));
  }
}
