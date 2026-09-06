import {
  CHECKPOINT_INTERVAL,
  type TestQuestion,
  is_reward_checkpoint,
  is_scorable_question,
  type TestSessionAction,
  type TestSessionState,
} from "./test-session.types";

export function create_initial_session_state(): TestSessionState {
  return {
    currentIndex: 0,
    score: 0,
    combo: 0,
    answeredScorableCount: 0,
    isComplete: false,
    feedback: null,
    isLocked: false,
    showCheckpoint: false,
    mistakes: [],
  };
}

export function test_session_reducer(
  state: TestSessionState,
  action: TestSessionAction,
  questions: readonly TestQuestion[],
): TestSessionState {
  if (action.type === "CLEAR_FEEDBACK") {
    return { ...state, feedback: null };
  }
  if (action.type === "ANSWER") {
    const isCorrect = action.isCorrect;
    const current = questions[state.currentIndex];
    if (!current || is_reward_checkpoint(current)) {
      return state;
    }
    const nextCombo = isCorrect ? state.combo + 1 : 0;
    const nextScore = isCorrect ? state.score + 1 + Math.min(state.combo, 5) : state.score;
    const nextAnswered = state.answeredScorableCount + 1;
    const shouldCheckpoint =
      nextAnswered > 0 && nextAnswered % CHECKPOINT_INTERVAL === 0;

    const nextMistakes = isCorrect
      ? state.mistakes
      : [...state.mistakes, { question: current, userAnswer: action.userAnswer }];

    return {
      ...state,
      score: nextScore,
      combo: nextCombo,
      answeredScorableCount: nextAnswered,
      feedback: isCorrect ? "correct" : "wrong",
      isLocked: true,
      showCheckpoint: shouldCheckpoint,
      mistakes: nextMistakes,
    };
  }
  if (action.type === "CONTINUE_CHECKPOINT") {
    return advance_after_feedback(state, questions);
  }
  if (action.type === "ADVANCE") {
    if (state.showCheckpoint) {
      return state;
    }
    return advance_after_feedback(state, questions);
  }
  return state;
}

function advance_after_feedback(
  state: TestSessionState,
  questions: readonly TestQuestion[],
): TestSessionState {
  const nextIndex = state.currentIndex + 1;
  const isComplete = nextIndex >= questions.length;
  return {
    ...state,
    currentIndex: nextIndex,
    isComplete,
    feedback: null,
    isLocked: false,
    showCheckpoint: false,
  };
}

export function count_scorable_questions(
  questions: readonly TestQuestion[],
): number {
  return questions.filter(is_scorable_question).length;
}