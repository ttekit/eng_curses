import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredAccessToken } from "../lib/api";
import {
  fetchFeed,
  markSegmentSeen,
  postContextShift,
  postWatchFeedback,
  type FeedSegment,
} from "../lib/srsApi";

const MAX_LOAD_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800;
const MAX_EXCLUDE_IDS = 400;
const LOAD_MORE_THRESHOLD = 4;

function isRetryableFeedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("socket hang up") ||
    message.includes("too many requests")
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildExcludeList(loadedIds: number[]): number[] {
  return loadedIds.slice(-MAX_EXCLUDE_IDS);
}

export function useFeed(pageSize = 12) {
  const [segments, setSegments] = useState<FeedSegment[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);
  const loadedIdsRef = useRef<number[]>([]);

  const rememberSegments = useCallback((incoming: FeedSegment[]) => {
    if (incoming.length === 0) {
      return;
    }
    loadedIdsRef.current = [
      ...loadedIdsRef.current,
      ...incoming.map((item) => item.segmentId),
    ];
  }, []);

  const requestFeedPage = useCallback(
    async (excludeSegmentIds: number[]): Promise<FeedSegment[]> => {
      let lastError: unknown = null;
      for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
        try {
          return await fetchFeed(pageSize, excludeSegmentIds);
        } catch (loadError) {
          lastError = loadError;
          const canRetry =
            attempt < MAX_LOAD_ATTEMPTS && isRetryableFeedError(loadError);
          if (canRetry) {
            await sleep(RETRY_DELAY_MS * attempt);
            continue;
          }
          throw loadError;
        }
      }
      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to load feed");
    },
    [pageSize],
  );

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    loadedIdsRef.current = [];
    if (!getStoredAccessToken()) {
      setError("Session expired. Please sign in again.");
      setIsLoading(false);
      return;
    }
    try {
      const next = await requestFeedPage([]);
      setSegments(next);
      rememberSegments(next);
      setActiveIndex(0);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load feed",
      );
    } finally {
      setIsLoading(false);
    }
  }, [rememberSegments, requestFeedPage]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const appendFeed = useCallback(async () => {
    if (loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    try {
      const exclude = buildExcludeList(loadedIdsRef.current);
      const incoming = await requestFeedPage(exclude);
      setSegments((current) => {
        const existing = new Set(current.map((item) => item.segmentId));
        const fresh = incoming.filter((item) => !existing.has(item.segmentId));
        if (fresh.length === 0) {
          return current;
        }
        rememberSegments(fresh);
        return [...current, ...fresh];
      });
    } finally {
      loadingMoreRef.current = false;
    }
  }, [rememberSegments, requestFeedPage]);

  const injectSegment = useCallback(
    (segment: FeedSegment) => {
      setSegments((current) => {
        if (current.some((item) => item.segmentId === segment.segmentId)) {
          return current;
        }
        rememberSegments([segment]);
        const next = [...current];
        next.splice(activeIndex + 1, 0, segment);
        return next;
      });
    },
    [activeIndex, rememberSegments],
  );

  const handleSegmentSeen = useCallback((segmentId: number) => {
    void markSegmentSeen(segmentId);
  }, []);

  const submitWatchFeedback = useCallback(
    async (segmentId: number, watchTimeSec: number, loopLengthSec: number) => {
      await postWatchFeedback({ segmentId, watchTimeSec, loopLengthSec });
    },
    [],
  );

  const submitContextShift = useCallback(
    async (segmentId: number, word: string) => {
      const result = await postContextShift({ segmentId, word });
      if (result.nextSegment) {
        injectSegment(result.nextSegment);
      }
      return result;
    },
    [injectSegment],
  );

  const updateActiveIndex = useCallback(
    (nextIndex: number) => {
      setActiveIndex(nextIndex);
      if (nextIndex >= segments.length - LOAD_MORE_THRESHOLD) {
        void appendFeed();
      }
    },
    [appendFeed, segments.length],
  );

  return {
    segments,
    activeIndex,
    isLoading,
    error,
    reload: loadFeed,
    updateActiveIndex,
    handleSegmentSeen,
    submitWatchFeedback,
    submitContextShift,
  };
}
