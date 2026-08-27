import type { FeedSegment } from "../../lib/srsApi";
import MicroPlayer from "../micro-player/MicroPlayer";

type FeedSlideProps = {
  segment: FeedSegment;
  isActive: boolean;
  onSegmentSeen: (segmentId: number) => void;
  onWatchFeedback: (
    segmentId: number,
    watchTimeSec: number,
    loopLengthSec: number,
  ) => Promise<void>;
  onContextShift: (segmentId: number, word: string) => Promise<unknown>;
};

export default function FeedSlide({
  segment,
  isActive,
  onSegmentSeen,
  onWatchFeedback,
  onContextShift,
}: FeedSlideProps) {
  return (
    <section className="relative h-[100dvh] min-h-[100dvh] w-full">
      <MicroPlayer
        segment={segment}
        isActive={isActive}
        onSegmentSeen={onSegmentSeen}
        onWatchFeedback={onWatchFeedback}
        onContextShift={onContextShift}
      />
    </section>
  );
}
