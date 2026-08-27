import { apiFetch, readApiErrorBody } from "./api";

export type FeedToken = {
  word: string;
  lemmaId: number;
  position: number;
  timeSinceLastReviewSec: number | null;
};

export type FeedSegment = {
  segmentId: number;
  contentVideoId: number;
  fileUrl: string;
  startTimeSec: number;
  endTimeSec: number;
  fullPhrase: string;
  difficultyLevel: string | null;
  tokens: FeedToken[];
  feedKind: "review" | "new";
};

export type ProgressInteractResponse = {
  wordId: number;
  word: string;
  memoryStrength: number;
  lastSeenAt: string;
  isKnown: boolean;
};

export type ContextShiftResponse = {
  nextSegment: FeedSegment | null;
  penalizedWord: string;
};

export type WatchFeedbackResponse = {
  updatedWords: string[];
  promotedWords: string[];
  skipped: boolean;
};

export type VocabularyHint = {
  translation: string | null;
  pronunciation: string | null;
  meaning: string | null;
};

export async function fetchFeed(
  limit = 20,
  excludeSegmentIds: number[] = [],
): Promise<FeedSegment[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (excludeSegmentIds.length > 0) {
    params.set("exclude", excludeSegmentIds.join(","));
  }
  const response = await apiFetch(`/feed?${params.toString()}`);
  if (!response.ok) {
    const message = await readApiErrorBody(response);
    if (response.status === 401) {
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(message || "Failed to load feed");
  }
  return response.json().then((payload: unknown) => {
    if (Array.isArray(payload)) {
      return payload as FeedSegment[];
    }
    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as { data?: unknown }).data)
    ) {
      return (payload as { data: FeedSegment[] }).data;
    }
    return [];
  });
}

export async function postContextShift(input: {
  segmentId: number;
  word: string;
}): Promise<ContextShiftResponse> {
  const response = await apiFetch("/feed/context-shift", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to load context shift segment");
  }
  return response.json() as Promise<ContextShiftResponse>;
}

export async function postWatchFeedback(input: {
  segmentId: number;
  watchTimeSec: number;
  loopLengthSec: number;
}): Promise<WatchFeedbackResponse> {
  const response = await apiFetch("/feed/watch-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to record watch feedback");
  }
  return response.json() as Promise<WatchFeedbackResponse>;
}

export async function postProgressInteract(input: {
  wordId: number;
  isCorrect: boolean;
  timeSinceLastReview: number;
}): Promise<ProgressInteractResponse> {
  const response = await apiFetch("/progress/interact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update progress");
  }
  return response.json() as Promise<ProgressInteractResponse>;
}

export async function fetchDueCount(): Promise<number> {
  const response = await apiFetch("/progress/due-count");
  if (!response.ok) {
    return 0;
  }
  const payload = (await response.json()) as { count?: number };
  return payload.count ?? 0;
}

export async function markSegmentSeen(segmentId: number): Promise<void> {
  await apiFetch(`/feed/${segmentId}/seen`, { method: "POST" });
}

export async function fetchQuickTranslations(
  words: string[],
  targetLang?: string | null,
): Promise<Record<string, string | null>> {
  const response = await apiFetch("/content-video/quick-translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ words, targetLang }),
  });
  if (!response.ok) {
    return {};
  }
  const payload = (await response.json()) as {
    translations?: Record<string, string | null>;
  };
  return payload.translations ?? {};
}

export async function fetchVocabularyHints(
  words: string[],
  targetLang?: string | null,
): Promise<Record<string, VocabularyHint>> {
  const response = await apiFetch("/content-video/vocabulary-hints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ words, targetLang }),
  });
  if (!response.ok) {
    return {};
  }
  const payload = (await response.json()) as {
    hints?: Record<string, VocabularyHint>;
  };
  return payload.hints ?? {};
}

export async function fetchPersonalizedVocabularyHints(
  contentVideoId: number,
  words: string[],
): Promise<Record<string, VocabularyHint>> {
  const response = await apiFetch(
    `/content-video/${contentVideoId}/vocabulary-personalize`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words }),
    },
  );
  if (!response.ok) {
    return {};
  }
  const payload = (await response.json()) as {
    hints?: Record<string, VocabularyHint>;
  };
  return payload.hints ?? {};
}
