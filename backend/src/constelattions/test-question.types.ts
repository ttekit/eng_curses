/**
 * Discriminated union types for interactive star test questions.
 */
export const QuestionType = {
  TEXT_PICK: "text_pick",
  VIDEO_RIDDLE: "video_riddle",
  SWIPE_CARD: "swipe_card",
  SENTENCE_BUILDER: "sentence_builder",
  BLIND_AUDIO: "blind_audio",
  REWARD_CHECKPOINT: "reward_checkpoint",
} as const;

export type QuestionTypeValue =
  (typeof QuestionType)[keyof typeof QuestionType];

export type VideoSegmentRef = {
  readonly contentVideoId?: number;
  readonly startTimeSec?: number;
  readonly endTimeSec?: number;
};

export type BaseQuestion = {
  readonly id: string;
  readonly type: QuestionTypeValue;
};

export type VideoRiddleQuestion = BaseQuestion & {
  readonly type: typeof QuestionType.VIDEO_RIDDLE;
  readonly segment?: VideoSegmentRef;
  readonly subtitleWithBlank: string;
  readonly options: readonly [string, string, string, string];
  readonly correctAnswer: string;
};

export type SwipeCardItem = {
  readonly id: string;
  readonly word: string;
  readonly hint: string;
  readonly thumbnailUrl?: string;
  readonly isMatch: boolean;
};

export type SwipeCardQuestion = BaseQuestion & {
  readonly type: typeof QuestionType.SWIPE_CARD;
  readonly cards: readonly SwipeCardItem[];
};

export type SentenceBuilderQuestion = BaseQuestion & {
  readonly type: typeof QuestionType.SENTENCE_BUILDER;
  readonly segment?: VideoSegmentRef;
  readonly targetPhrase: string;
  readonly wordChips: readonly string[];
};

export type TextPickQuestion = BaseQuestion & {
  readonly type: typeof QuestionType.TEXT_PICK;
  readonly prompt?: string;
  readonly options: readonly [string, string, string];
  readonly correctAnswer: string;
};

export type BlindAudioQuestion = BaseQuestion & {
  readonly type: typeof QuestionType.BLIND_AUDIO;
  readonly segment?: VideoSegmentRef;
  readonly prompt?: string;
  readonly options: readonly [string, string, string];
  readonly correctAnswer: string;
};

export type RewardCheckpointQuestion = BaseQuestion & {
  readonly type: typeof QuestionType.REWARD_CHECKPOINT;
  readonly segment?: VideoSegmentRef;
  readonly message: string;
};

export type TestQuestion =
  | TextPickQuestion
  | VideoRiddleQuestion
  | SwipeCardQuestion
  | SentenceBuilderQuestion
  | BlindAudioQuestion
  | RewardCheckpointQuestion;

export type LegacyQuizItem = {
  readonly question: string;
  readonly options: readonly string[];
  readonly correctAnswer: string;
};

export type ScorableQuestion = Exclude<
  TestQuestion,
  RewardCheckpointQuestion
>;

export function is_scorable_question(
  question: TestQuestion,
): question is ScorableQuestion {
  return question.type !== QuestionType.REWARD_CHECKPOINT;
}
