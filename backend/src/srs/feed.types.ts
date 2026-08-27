import type { FeedMode } from "src/recommendation-engine/recommendation.types";

export type FeedTokenDto = {
  word: string;
  lemmaId: number;
  position: number;
  timeSinceLastReviewSec: number | null;
};

export type FeedSegmentDto = {
  segmentId: number;
  contentVideoId: number;
  fileUrl: string;
  startTimeSec: number;
  endTimeSec: number;
  fullPhrase: string;
  difficultyLevel: string | null;
  tokens: FeedTokenDto[];
  feedKind: FeedMode;
};
