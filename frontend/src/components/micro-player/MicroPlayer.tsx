import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Hls from "hls.js";
import type { FeedSegment, FeedToken } from "../../lib/srsApi";
import { useUser } from "../../context/UserContext";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useProgressInteract } from "../../hooks/useProgressInteract";
import InteractiveSubtitle from "./InteractiveSubtitle";
import { useSegmentLoop } from "./useSegmentLoop";
import { useWordHint } from "./useWordHint";
import WordReviewModal from "./WordReviewModal";

type MicroPlayerProps = {
  segment: FeedSegment;
  isActive?: boolean;
  onSegmentSeen?: (segmentId: number) => void;
  onWatchFeedback?: (
    segmentId: number,
    watchTimeSec: number,
    loopLengthSec: number,
  ) => Promise<void>;
  onContextShift?: (segmentId: number, word: string) => Promise<unknown>;
};

export default function MicroPlayer({
  segment,
  isActive = true,
  onSegmentSeen,
  onWatchFeedback,
  onContextShift,
}: MicroPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const seenReportedRef = useRef(false);
  const watchStartedAtRef = useRef<number | null>(null);
  const [activeToken, setActiveToken] = useState<FeedToken | null>(null);
  const { user } = useUser();
  const { locale } = useLandingLocale();
  const { hint, hintStatus, loadHint, prefetchWords, resetHint } = useWordHint(
    user?.nativeLanguage,
    locale,
  );
  const { submitInteraction, isSubmitting } = useProgressInteract();
  const loopLengthSec = Math.max(
    segment.endTimeSec - segment.startTimeSec,
    0.1,
  );

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !segment.fileUrl) {
      return;
    }
    if (segment.fileUrl.includes(".m3u8") && Hls.isSupported()) {
      hlsRef.current?.destroy();
      const hls = new Hls({ maxMaxBufferLength: 10, enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(segment.fileUrl);
      hls.attachMedia(node);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (node.readyState >= 1) {
          node.currentTime = segment.startTimeSec;
        }
      });
    } else {
      node.src = segment.fileUrl;
      node.currentTime = segment.startTimeSec;
    }
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [segment.fileUrl, segment.startTimeSec]);

  useEffect(() => {
    seenReportedRef.current = false;
    watchStartedAtRef.current = null;
    setActiveToken(null);
    resetHint();
  }, [resetHint, segment.segmentId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (!isActive) {
      video.pause();
      watchStartedAtRef.current = null;
      return;
    }
    watchStartedAtRef.current = Date.now();
    const start_playback = (): void => {
      video.currentTime = segment.startTimeSec;
      void video.play().catch(() => undefined);
    };
    if (video.readyState >= 1) {
      start_playback();
      return;
    }
    video.addEventListener("loadedmetadata", start_playback, { once: true });
    return () => {
      video.removeEventListener("loadedmetadata", start_playback);
    };
  }, [isActive, segment.segmentId, segment.startTimeSec]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    void prefetchWords(segment.tokens.map((token) => token.word));
  }, [isActive, prefetchWords, segment.segmentId]);

  const handleLoopComplete = useCallback(() => {
    if (seenReportedRef.current) {
      return;
    }
    seenReportedRef.current = true;
    onSegmentSeen?.(segment.segmentId);
    const startedAt = watchStartedAtRef.current ?? Date.now();
    const watchTimeSec = (Date.now() - startedAt) / 1000;
    void onWatchFeedback?.(segment.segmentId, watchTimeSec, loopLengthSec);
    watchStartedAtRef.current = Date.now();
  }, [loopLengthSec, onSegmentSeen, onWatchFeedback, segment.segmentId]);

  useSegmentLoop({
    videoRef,
    startTimeSec: segment.startTimeSec,
    endTimeSec: segment.endTimeSec,
    enabled: isActive && !activeToken,
    onLoopComplete: handleLoopComplete,
  });

  const handleWordClick = useCallback(async (token: FeedToken) => {
    videoRef.current?.pause();
    setActiveToken(token);
    void onContextShift?.(segment.segmentId, token.word);
    await loadHint({ word: token.word.trim() || token.word });
  }, [loadHint, onContextShift, segment.segmentId]);

  const closeModal = useCallback(() => {
    setActiveToken(null);
    resetHint();
    if (isActive) {
      void videoRef.current?.play().catch(() => undefined);
    }
  }, [isActive, resetHint]);

  const handleReview = useCallback(
    async (isCorrect: boolean) => {
      if (!activeToken) {
        return;
      }
      await submitInteraction({
        wordId: activeToken.lemmaId,
        isCorrect,
        timeSinceLastReview: activeToken.timeSinceLastReviewSec ?? 0,
      });
      closeModal();
    },
    [activeToken, closeModal, submitInteraction],
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted={false}
        preload="metadata"
      />
      <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pb-10 pt-16">
        <InteractiveSubtitle
          fullPhrase={segment.fullPhrase}
          tokens={segment.tokens}
          onWordClick={handleWordClick}
        />
      </div>
      {activeToken ? (
        <div className="pointer-events-auto absolute inset-0 z-30">
          <WordReviewModal
            word={activeToken.word}
            hint={hint}
            hintStatus={hintStatus}
            isSubmitting={isSubmitting}
            onKnow={() => void handleReview(true)}
            onLearning={() => void handleReview(false)}
            onClose={closeModal}
          />
        </div>
      ) : null}
    </div>
  );
}
