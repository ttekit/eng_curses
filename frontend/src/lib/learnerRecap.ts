/**
 * Learner training hub: mistakes practice, weekly summary, monthly summary.
 */

import { apiFetch } from "./api";

export type RecapKind = "mistakes" | "weekly" | "monthly";

export type RecapStatusItem = {
  kind: RecapKind;
  available: boolean;
  completedInPeriod: boolean;
  nextAvailableAt: string | null;
  lastScorePct: number | null;
  lessonCount: number;
  reason: string | null;
};

export type LearnerRecapStatusResponse = {
  mistakes: RecapStatusItem;
  weekly: RecapStatusItem;
  monthly: RecapStatusItem;
};

export type GenerateRecapResponse = {
  kind: RecapKind;
  source: "gemini" | "fallback";
  recapLabel: string;
  tests: Array<{
    id?: string;
    question?: string;
    questionType?: string;
    options?: string[];
    correctIndex?: number;
    category?: string;
    explanation?: string;
  }>;
  gradingToken: string;
  lessonTitles: string[];
};

export type SubmitRecapResponse = {
  kind: RecapKind;
  correct: number;
  total: number;
  percentage: number;
  message: string;
};

/**
 * Fetches availability for all three recap types.
 */
export async function fetchLearnerRecapStatus(): Promise<LearnerRecapStatusResponse | null> {
  try {
    const res = await apiFetch("/learner-recap/status", { method: "GET" });
    if (!res.ok) return null;
    return (await res.json()) as LearnerRecapStatusResponse;
  } catch {
    return null;
  }
}

/**
 * Generates a recap quiz when the server allows it.
 */
export async function generateLearnerRecap(
  kind: RecapKind,
): Promise<GenerateRecapResponse | { error: string } | null> {
  try {
    const res = await apiFetch(`/learner-recap/${kind}/generate`, {
      method: "POST",
    });
    if (!res.ok) {
      try {
        const err = (await res.json()) as { message?: string | string[] };
        const msg = Array.isArray(err.message)
          ? err.message[0]
          : err.message;
        if (typeof msg === "string" && msg.trim()) {
          return { error: msg.trim() };
        }
      } catch {
        /* ignore */
      }
      return null;
    }
    return (await res.json()) as GenerateRecapResponse;
  } catch {
    return null;
  }
}

/**
 * Submits recap answers and records the cooldown on the server.
 */
export async function submitLearnerRecap(
  kind: RecapKind,
  token: string,
  answers: Record<string, number>,
): Promise<SubmitRecapResponse | null> {
  try {
    const res = await apiFetch(`/learner-recap/${kind}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    });
    if (!res.ok) return null;
    return (await res.json()) as SubmitRecapResponse;
  } catch {
    return null;
  }
}

/**
 * Human-readable countdown until `iso` (or null if already past).
 */
export function formatRecapCooldown(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin < 60) {
    return locale === "uk"
      ? `${totalMin} хв`
      : `${totalMin} min`;
  }
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h < 48) {
    return locale === "uk"
      ? m > 0
        ? `${h} год ${m} хв`
        : `${h} год`
      : m > 0
        ? `${h}h ${m}m`
        : `${h}h`;
  }
  const days = Math.ceil(totalMin / (60 * 24));
  return locale === "uk" ? `${days} дн` : `${days}d`;
}
