import { useEffect } from "react";
import FeedSlide from "../../components/feed/FeedSlide";
import { useFeed } from "../../hooks/useFeed";
import { useFeedNavigation } from "../../hooks/useFeedNavigation";

export default function FeedPage() {
  const {
    segments,
    activeIndex,
    isLoading,
    error,
    reload,
    updateActiveIndex,
    handleSegmentSeen,
    submitWatchFeedback,
    submitContextShift,
  } = useFeed();

  const safeIndex =
    segments.length > 0
      ? Math.min(Math.max(activeIndex, 0), segments.length - 1)
      : 0;
  const currentSegment = segments[safeIndex] ?? null;

  useFeedNavigation(segments.length, safeIndex, updateActiveIndex, !isLoading);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black text-white">
        Loading your feed…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <p>{error}</p>
        <button
          type="button"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
          onClick={() => void reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentSegment) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <p>No clips matched your level yet.</p>
        <button
          type="button"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
          onClick={() => void reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <FeedSlide
        key={currentSegment.segmentId}
        segment={currentSegment}
        isActive
        onSegmentSeen={handleSegmentSeen}
        onWatchFeedback={submitWatchFeedback}
        onContextShift={submitContextShift}
      />
      <div className="pointer-events-none absolute right-3 top-3 z-50 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
        {safeIndex + 1} / {segments.length}
      </div>
    </div>
  );
}
