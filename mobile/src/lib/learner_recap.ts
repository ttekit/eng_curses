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

type LearnerRecapStatusResponse = {
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
    options?: string[];
    correctIndex?: number;
    explanation?: string;
  }>;
  gradingToken: string;
  lessonTitles: string[];
};

type SubmitRecapResponse = {
  kind: RecapKind;
  correct: number;
  total: number;
  percentage: number;
  message: string;
};

export async function fetch_learner_recap_status(): Promise<LearnerRecapStatusResponse | null> {
  try {
    const response = await apiFetch("/learner-recap/status", { method: "GET" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as LearnerRecapStatusResponse;
  } catch {
    return null;
  }
}

export async function generate_learner_recap(
  kind: RecapKind,
): Promise<GenerateRecapResponse | { error: string } | null> {
  try {
    const response = await apiFetch(`/learner-recap/${kind}/generate`, {
      method: "POST",
    });
    if (!response.ok) {
      const message = await response.text();
      return { error: message || "Could not start recap." };
    }
    return (await response.json()) as GenerateRecapResponse;
  } catch {
    return null;
  }
}

export async function submit_learner_recap(
  kind: RecapKind,
  token: string,
  answers: Record<string, number>,
): Promise<SubmitRecapResponse | null> {
  try {
    const response = await apiFetch(`/learner-recap/${kind}/submit`, {
      method: "POST",
      body: JSON.stringify({ token, answers }),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SubmitRecapResponse;
  } catch {
    return null;
  }
}

export function format_recap_cooldown(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) {
    return null;
  }
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
