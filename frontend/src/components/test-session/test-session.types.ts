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
  readonly prompt?: string;
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

export type AnswerResult = {
  readonly isCorrect: boolean;
  readonly userAnswer?: string;
};

export type FeedbackKind = "correct" | "wrong" | null;

export type TestMistake = {
  readonly question: TestQuestion;
  readonly userAnswer?: string;
};

export type TestSessionState = {
  readonly currentIndex: number;
  readonly score: number;
  readonly combo: number;
  readonly answeredScorableCount: number;
  readonly isComplete: boolean;
  readonly feedback: FeedbackKind;
  readonly isLocked: boolean;
  readonly showCheckpoint: boolean;
  readonly mistakes: readonly TestMistake[];
};

export type TestSessionAction =
  | { type: "ANSWER"; isCorrect: boolean; userAnswer?: string }
  | { type: "ADVANCE" }
  | { type: "CONTINUE_CHECKPOINT" }
  | { type: "CLEAR_FEEDBACK" };

export const CHECKPOINT_INTERVAL = 15;
export const AUTO_ADVANCE_MS = 1000;

export function is_scorable_question(
  question: TestQuestion,
): question is Exclude<TestQuestion, RewardCheckpointQuestion> {
  return question.type !== QuestionType.REWARD_CHECKPOINT;
}

export function is_reward_checkpoint(
  question: TestQuestion,
): question is RewardCheckpointQuestion {
  return question.type === QuestionType.REWARD_CHECKPOINT;
}