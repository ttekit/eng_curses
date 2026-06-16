import type { RegistrationFormData } from "../types/registration";
import { apiFetch, readApiErrorBody } from "./api";
import { clear_registration_draft } from "./registration_storage";

export type GeneratedStudentAccount = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResult =
  | {
      success: true;
      generatedStudents?: GeneratedStudentAccount[];
      accessToken?: string;
      requiresEmailVerification?: boolean;
    }
  | { success: false; message: string };

const CHOOSE = "choose";

function clean_optional_string(value: string | undefined): string | undefined {
  if (!value || value === CHOOSE) {
    return undefined;
  }
  return value;
}

export function get_register_credentials_error(
  formData: RegistrationFormData,
): string | null {
  const email = formData.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }
  if (!formData.password || formData.password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

export function build_register_body(
  formData: RegistrationFormData,
  captchaToken: string,
): Record<string, unknown> {
  const isTeacher = formData.role === "teacher";
  const rawNames = formData.studentNames;
  const teacherPupils =
    isTeacher && Array.isArray(rawNames) ? rawNames : isTeacher ? [] : null;

  const body: Record<string, unknown> = {
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password,
    captchaToken,
  };

  if (formData.dateOfBirth.trim()) {
    body.dateOfBirth = formData.dateOfBirth.trim();
  }

  if (formData.role && formData.role !== CHOOSE) {
    body.role = formData.role;
  }
  if (isTeacher) {
    const grades = clean_optional_string(formData.teacherGrades);
    if (grades) {
      body.teacherGrades = grades;
    }
    body.teacherTopics = formData.teacherTopics;
    body.studentNames = teacherPupils;
  }
  const englishLevel = clean_optional_string(formData.englishLevel);
  if (englishLevel) {
    body.englishLevel = englishLevel;
  }
  const education = clean_optional_string(formData.education);
  if (education) {
    body.education = education;
  }
  const workField = clean_optional_string(formData.workField);
  if (workField) {
    body.workField = workField;
  }
  body.hobbies = formData.hobbies.length > 0 ? formData.hobbies : [];
  body.favoriteGenres = isTeacher ? [] : formData.favoriteGenres;
  body.hatedGenres = isTeacher ? [] : formData.hatedGenres;
  if (formData.role === "adult") {
    if (formData.learningGoal.trim()) {
      body.learningGoal = formData.learningGoal.trim();
    }
    if (formData.timeToAchieve.trim()) {
      body.timeToAchieve = formData.timeToAchieve.trim();
    }
  }
  return body;
}

export async function register_user(
  formData: RegistrationFormData,
  captchaToken: string,
): Promise<RegisterResult> {
  const credsError = get_register_credentials_error(formData);
  if (credsError) {
    return { success: false, message: credsError };
  }
  if (!captchaToken.trim()) {
    return { success: false, message: "Please wait for captcha verification." };
  }
  try {
    const response = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(build_register_body(formData, captchaToken)),
    });
    if (!response.ok) {
      return { success: false, message: await readApiErrorBody(response) };
    }
    await clear_registration_draft();
    const data = (await response.json()) as {
      generatedStudents?: GeneratedStudentAccount[];
      access_token?: string;
      requiresEmailVerification?: boolean;
    };
    return {
      success: true,
      generatedStudents: data.generatedStudents,
      accessToken: data.access_token,
      requiresEmailVerification: Boolean(data.requiresEmailVerification),
    };
  } catch {
    return { success: false, message: "Could not reach the Explys API." };
  }
}
