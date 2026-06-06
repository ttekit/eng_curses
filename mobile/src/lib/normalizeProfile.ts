/**
 * Normalizes `GET /auth/profile` into `UserData`.
 */
import type { UserData } from "../types/user";

function stripChoosePlaceholder(raw: unknown): string {
  const s = String(raw ?? "").trim();
  return s.toLowerCase() === "choose" ? "" : s;
}

function coerceHasCompletedPlacement(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0 || raw == null) return false;
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    return s === "true" || s === "1";
  }
  return false;
}

function normalizeLearnerRole(raw: unknown): string {
  const s = String(raw ?? "adult")
    .trim()
    .toLowerCase();
  if (s.length === 0) return "adult";
  if (s === "regular") return "adult";
  return s;
}

export function normalizeProfile(raw: unknown): UserData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    dateOfBirth: String(r.dateOfBirth ?? ""),
    role: normalizeLearnerRole(r.role),
    isTwoFactorEnable: Boolean(r.isTwoFactorEnable),
    hasCompletedPlacement: coerceHasCompletedPlacement(r.hasCompletedPlacement),
    englishLevel: String(r.englishLevel ?? ""),
    education: stripChoosePlaceholder(r.education),
    workField: stripChoosePlaceholder(r.workField),
    nativeLanguage: stripChoosePlaceholder(r.nativeLanguage),
    hobbies: Array.isArray(r.hobbies) ? (r.hobbies as string[]) : [],
    favoriteGenres: Array.isArray(r.favoriteGenres)
      ? (r.favoriteGenres as number[])
      : [],
    hatedGenres: Array.isArray(r.hatedGenres) ? (r.hatedGenres as number[]) : [],
    avatarUrl: typeof r.avatarUrl === "string" ? r.avatarUrl : undefined,
    playbackSpeed: (() => {
      const v = r.playbackSpeed;
      if (v === null || v === undefined) return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : null;
    })(),
    videoQuality: typeof r.videoQuality === "string" ? r.videoQuality : "",
    learningGoal: typeof r.learningGoal === "string" ? r.learningGoal : "",
    timeToAchieve: typeof r.timeToAchieve === "string" ? r.timeToAchieve : "",
    subscriptionPlan:
      typeof r.subscriptionPlan === "string" ? r.subscriptionPlan : "",
    subscriptionStatus:
      typeof r.subscriptionStatus === "string" ? r.subscriptionStatus : "",
    stripeSubscriptionId:
      typeof r.stripeSubscriptionId === "string" ? r.stripeSubscriptionId : "",
    teacherId: (() => {
      const t = r.teacherId;
      if (t === null || t === undefined) return null;
      const n = typeof t === "number" ? t : Number(t);
      return Number.isFinite(n) ? n : null;
    })(),
    teacherName: typeof r.teacherName === "string" ? r.teacherName : null,
    currentStreak: Number(r.currentStreak) || 0,
    xp: Number(r.xp) || 0,
    level: Number(r.level) || 1,
    achievements: Array.isArray(r.achievements) ? (r.achievements as string[]) : [],
  };
}
