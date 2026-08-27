import type { AnswerResult, TestQuestion } from "../test-session.types";

export type QuestionComponentProps<T extends TestQuestion> = {
  readonly question: T;
  readonly disabled: boolean;
  readonly onAnswer: (result: AnswerResult) => void;
};
