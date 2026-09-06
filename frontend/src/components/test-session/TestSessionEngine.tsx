import { useCallback, useEffect, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { AnswerFeedbackOverlay } from "./AnswerFeedbackOverlay";
import { SegmentedProgressBar } from "./SegmentedProgressBar";
import { InjectedRewardCheckpoint } from "./questions/RewardCheckpoint";
import { render_question } from "./questions/renderQuestion";
import {
  AUTO_ADVANCE_MS,
  type AnswerResult,
  type TestQuestion,
  type SwipeCardItem,
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
  readonly completionMessage?: string;
};

export function TestSessionEngine({
  questions,
  onSessionComplete,
  completing = false,
  completionMessage = "Вітаємо! Ви успішно завершили цей етап. Тепер ви можете впевнено використовувати ці знання на практиці!",
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
      dispatch({
        type: "ANSWER",
        isCorrect: result.isCorrect,
        userAnswer: result.userAnswer
      });
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-8 animate-in fade-in duration-500">
        <div className="w-full max-w-2xl bg-[#0B0C10] border border-white/5 rounded-[24px] p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="mb-8 text-xs font-bold text-amber-400 uppercase tracking-widest">
            {state.combo > 1 ? `Combo x${state.combo}` : `Score: ${state.score}`}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-10 leading-tight max-w-[90%]">
            {completionMessage}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (!completing) onSessionComplete();
            }}
            disabled={completing}
            className="px-8 py-3.5 rounded-2xl bg-[#34D399] hover:bg-[#2BB884] text-[#022C22] font-bold text-base sm:text-lg transition-all shadow-[0_4px_20px_rgba(52,211,153,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {completing ? "Збереження..." : "Continue"}
          </button>
        </div>

        {state.mistakes.length > 0 && (
          <div className="w-full max-w-2xl mt-4 animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" />
              Ось ваші помилки ({state.mistakes.length})
            </h3>
            <div className="flex flex-col gap-4">
              {state.mistakes.map((m, i) => {
                let prompt = "Завдання";
                let correct = "";
                const userAns = m.userAnswer || "Немає відповіді";

                if (m.question.type === "text_pick" || m.question.type === "blind_audio") {
                  prompt = m.question.prompt || "Оберіть правильний варіант";
                  correct = m.question.correctAnswer;
                } else if (m.question.type === "video_riddle") {
                  prompt = m.question.subtitleWithBlank;
                  correct = m.question.correctAnswer;
                } else if (m.question.type === "sentence_builder") {
                  prompt = "Зберіть фразу:";
                  correct = m.question.targetPhrase;
                } else if (m.question.type === "swipe_card") {
                  prompt = "Свайп-картки";
                  correct = m.question.cards.filter((c: SwipeCardItem) => c.isMatch).map((c: SwipeCardItem) => c.word).join(", ");
                }

                return (
                  <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50"></div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{prompt}</p>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2 text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">
                        <XCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-80" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-70">Ваша відповідь:</span>
                          <span className="font-medium text-destructive/90">{userAns}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-[#34D399] bg-[#34D399]/10 rounded-xl p-3 border border-[#34D399]/20">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-80">Правильна відповідь:</span>
                          <span className="font-medium text-[#6EE7B7]">{correct || "Див. контекст"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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