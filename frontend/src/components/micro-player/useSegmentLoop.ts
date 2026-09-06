import { useEffect } from "react";

type SegmentLoopOptions = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startTimeSec: number;
  endTimeSec: number;
  enabled?: boolean;
  onLoopComplete?: () => void;
};

const SEEK_EPSILON_SEC = 0.08;

function seek_to_segment_start(
  video: HTMLVideoElement,
  startTimeSec: number,
  endTimeSec: number,
): void {
  if (video.readyState === 0) {
    return;
  }
  if (
    video.currentTime < startTimeSec - SEEK_EPSILON_SEC ||
    video.currentTime > endTimeSec - SEEK_EPSILON_SEC
  ) {
    video.currentTime = startTimeSec;
  }
}

export function useSegmentLoop({
  videoRef,
  startTimeSec,
  endTimeSec,
  enabled = true,
  onLoopComplete,
}: SegmentLoopOptions): void {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) {
      return;
    }

    const sync_start = (): void => {
      seek_to_segment_start(video, startTimeSec, endTimeSec);
    };

    const handle_time_update = (): void => {
      if (video.currentTime >= endTimeSec - SEEK_EPSILON_SEC) {
        video.currentTime = startTimeSec;
        onLoopComplete?.();
      }
    };

    sync_start();
    video.addEventListener("loadedmetadata", sync_start);
    video.addEventListener("loadeddata", sync_start);
    video.addEventListener("canplay", sync_start);
    video.addEventListener("timeupdate", handle_time_update);

    return () => {
      video.removeEventListener("loadedmetadata", sync_start);
      video.removeEventListener("loadeddata", sync_start);
      video.removeEventListener("canplay", sync_start);
      video.removeEventListener("timeupdate", handle_time_update);
    };
  }, [videoRef, startTimeSec, endTimeSec, enabled, onLoopComplete]);
}
