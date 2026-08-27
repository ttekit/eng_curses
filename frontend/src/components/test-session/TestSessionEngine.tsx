import { useCallback, useEffect, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import { AnswerFeedbackOverlay } from "./AnswerFeedbackOverlay";
import { SegmentedProgressBar } from "./SegmentedProgressBar";
import { InjectedRewardCheckpoint } from "./questions/RewardCheckpoint";
import { render_question } from "./questions/renderQuestion";
import {
  AUTO_ADVANCE_MS,
  type AnswerResult,
  type TestQuestion,
} from "./test-session.types";
import {
  count_scorable_questions,
  create_initial_session_state,
  test_session_reducer,
} from "./useTestSessionState";
import { useAnswerFeedback } from "./useAnswerFeedback";

type TestSessionEngineProps = {
  readonly questions: readonly TestQuestion[];
  readonly onSessionComplete: () => void;
  readonly completing?: boolean;
};

/**
 * Orchestrates dynamic quiz session with progress and feedback.
 */
export function TestSessionEngine({
  questions,
  onSessionComplete,
  completing = false,
}: TestSessionEngineProps) {
  const [state, dispatch] = useReducer(
    (prev, action) => test_session_reducer(prev, action, questions),
    undefined,
    create_initial_session_state,
  );
  const { apply_feedback } = useAnswerFeedback();
  const advanceTimerRef = useRef<number | null>(null);
  const currentQuestion = questions[state.currentIndex];

  useEffect(() => {
    if (state.isComplete && !completing) {
      onSessionComplete();
    }
  }, [state.isComplete, completing, onSessionComplete]);

  useEffect(() => {
    if (!state.feedback) {
      return;
    }
    apply_feedback(state.feedback);
    if (state.showCheckpoint) {
      return;
    }
    advanceTimerRef.current = window.setTimeout(() => {
      dispatch({ type: "ADVANCE" });
    }, AUTO_ADVANCE_MS);
    return () => {
      if (advanceTimerRef.current) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, [state.feedback, state.showCheckpoint, apply_feedback]);

  const handle_answer = useCallback(
    (result: AnswerResult) => {
      if (state.isLocked) {
        return;
      }
      dispatch({ type: "ANSWER", isCorrect: result.isCorrect });
    },
    [state.isLocked],
  );

  const handle_continue_checkpoint = useCallback(() => {
    dispatch({ type: "CONTINUE_CHECKPOINT" });
  }, []);

  const handle_checkpoint_continue = useCallback(() => {
    dispatch({ type: "ADVANCE" });
  }, []);

  if (questions.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No questions available.
      </p>
    );
  }

  if (state.isComplete) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-foreground">Session complete!</p>
        <p className="text-muted-foreground">Score: {state.score}</p>
      </div>
    );
  }

  const totalScorable = count_scorable_questions(questions);
  const filledSegments = Math.min(state.currentIndex, totalScorable);

  return (
    <div className="-mx-4 flex flex-col">
      <div className="space-y-2 px-4 pb-3">
        <SegmentedProgressBar
          totalSegments={totalScorable}
          filledSegments={filledSegments}
        />
        {state.combo > 1 ? (
          <p className="text-center text-xs font-bold uppercase tracking-wider text-amber-400">
            Combo x{state.combo}
          </p>
        ) : null}
      </div>
      <motion.div
        key={state.showCheckpoint ? "checkpoint" : currentQuestion?.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 min-h-[calc(100dvh-10rem)]"
      >
        <AnswerFeedbackOverlay feedback={state.feedback} />
        {state.showCheckpoint ? (
          <InjectedRewardCheckpoint
            onContinue={handle_continue_checkpoint}
          />
        ) : currentQuestion ? (
          render_question({
            question: currentQuestion,
            disabled: state.isLocked,
            onAnswer: handle_answer,
            onContinue: handle_checkpoint_continue,
          })
        ) : null}
      </motion.div>
    </div>
  );
}
