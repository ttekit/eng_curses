export const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export function validate_register_name(name: string): string | null {
  if (!name.trim()) {
    return "Enter your name.";
  }
  return null;
}

export function validate_register_email(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Enter your email.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function validate_register_passwords(
  password: string,
  confirmPassword: string,
): string | null {
  if (!passwordPattern.test(password)) {
    return "Password needs 8+ chars with upper, lower, number, and special character.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function validate_register_dob(dateOfBirth: string): string | null {
  if (!dateOfBirth.trim()) {
    return "Enter your date of birth.";
  }
  return null;
}
