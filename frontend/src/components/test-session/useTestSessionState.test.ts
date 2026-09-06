import { describe, expect, it } from "vitest";
import {
  CHECKPOINT_INTERVAL,
  QuestionType,
  type TestQuestion,
} from "./test-session.types";
import {
  create_initial_session_state,
  test_session_reducer,
} from "./useTestSessionState";

const sampleQuestions: TestQuestion[] = Array.from({ length: 16 }, (_, index) => ({
  id: `q-${index + 1}`,
  type: QuestionType.BLIND_AUDIO,
  prompt: `Question ${index + 1}`,
  options: ["A", "B", "C"] as const,
  correctAnswer: "A",
}));

describe("useTestSessionState", () => {
  it("triggers checkpoint every 15 scorable answers", () => {
    let state = create_initial_session_state();
    for (let index = 0; index < CHECKPOINT_INTERVAL; index += 1) {
      state = test_session_reducer(state, { type: "ANSWER", isCorrect: true }, sampleQuestions);
    }
    expect(state.showCheckpoint).toBe(true);
    expect(state.answeredScorableCount).toBe(CHECKPOINT_INTERVAL);
  });

  it("advances index after checkpoint continue", () => {
    let state = create_initial_session_state();
    state = test_session_reducer(state, { type: "ANSWER", isCorrect: true }, sampleQuestions);
    state = test_session_reducer(state, { type: "CONTINUE_CHECKPOINT" }, sampleQuestions);
    expect(state.currentIndex).toBe(1);
    expect(state.showCheckpoint).toBe(false);
  });
});
