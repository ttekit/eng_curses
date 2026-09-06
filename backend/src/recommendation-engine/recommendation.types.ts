export type FeedMode = "review" | "new";

export type Vector384 = readonly number[] & { readonly __brand?: "Vector384" };

export type ScoreBreakdown = {
  sContext: number;
  sLevel: number;
  sAccent: number;
  sSrs: number;
  total: number;
};

export type ScoredSegmentCandidate = {
  segmentId: number;
  contentVideoId: number;
  startTimeSec: number;
  endTimeSec: number;
  fullPhrase: string;
  proficiencyLevel: number | null;
  accent: string;
  words: string[];
  breakdown: ScoreBreakdown;
  feedKind: FeedMode;
};

export type WordMemoryRow = {
  word: string;
  lastSeenAt: Date;
  memoryStrength: number;
};

export type LearnerLexicon = {
  knownWords: Set<string>;
  learningWords: Map<string, WordMemoryRow>;
};

export type LearnerProfileState = {
  userId: number;
  proficiencyLevel: number;
  targetAccent: string;
  interestsVector: Vector384 | null;
  knownWords: string[];
};

export type SegmentCandidateRow = {
  id: number;
  content_video_id: number;
  start_time_sec: number;
  end_time_sec: number;
  full_phrase: string;
  proficiency_level: number | null;
  accent: string;
  words: string[];
  cos_sim: number | null;
};

export type WatchFeedbackResult = {
  updatedWords: string[];
  promotedWords: string[];
  skipped: boolean;
};

export type ContextShiftResult = {
  nextSegment: import("../srs/feed.types").FeedSegmentDto | null;
  penalizedWord: string;
};
