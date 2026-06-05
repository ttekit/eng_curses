import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import type { QuizQuestion } from "./defaultLessonSides";

export type InVideoAnswerPayload = {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: QuizQuestion["category"];
};

interface InVideoQuestionOverlayProps {
  question: QuizQuestion;
  questionIndex: number;
  totalMcq: number;
  onAnswer: (payload: InVideoAnswerPayload) => void;
}

export function InVideoQuestionOverlay({
  question,
  questionIndex,
  totalMcq,
  onAnswer,
}: InVideoQuestionOverlayProps) {
  const L = useAppMessages().lesson;
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoryLabel =
    question.category === "grammar"
      ? L.categoryGrammar
      : question.category === "vocabulary"
        ? L.categoryVocabulary
        : question.category === "comprehension"
          ? L.categoryComprehension
          : null;

  function handleContinue() {
    if (!isAnswered) {
      if (selectedAnswer === null) {
        setErrorMsg(L.selectOptionError);
        return;
      }
      setIsAnswered(true);
      return;
    }
    if (selectedAnswer === null) return;
    onAnswer({
      questionId: question.id,
      selectedIndex: selectedAnswer,
      isCorrect: selectedAnswer === question.correct,
      question: question.question,
      options: question.options,
      correctIndex: question.correct,
      explanation: question.explanation,
      category: question.category,
    });
  }

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] items-stretch p-2 sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="in-video-quiz-title"
    >
      <div className="pointer-events-auto flex max-h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-md">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">
            {formatMessage(L.inVideoQuestionOf, {
              current: String(questionIndex + 1),
              total: String(totalMcq),
            })}
          </p>
          <p className="mt-1 text-xs text-white/70">{L.inVideoQuizHint}</p>

          {categoryLabel ? (
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {categoryLabel}
            </p>
          ) : null}

          <h2
            id="in-video-quiz-title"
            className="mt-2 text-base leading-snug font-semibold text-white sm:text-lg"
          >
            {question.question}
          </h2>

          <div className="mt-3 space-y-1.5">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const lockedInThis = isAnswered && isSelected;
              return (
                <button
                  key={index}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => {
                    if (!isAnswered) {
                      setSelectedAnswer(index);
                      if (errorMsg) setErrorMsg(null);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all hover:cursor-pointer",
                    !isAnswered && isSelected && "border-primary bg-primary/20",
                    !isAnswered &&
                      !isSelected &&
                      "border-white/10 bg-white/5 hover:border-primary/40",
                    lockedInThis &&
                      "border-primary bg-primary/15 ring-1 ring-primary/30",
                    isAnswered && !isSelected && "opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                      !isAnswered &&
                        isSelected &&
                        "bg-primary text-primary-foreground",
                      !isAnswered &&
                        !isSelected &&
                        "bg-white/10 text-white/70",
                      lockedInThis && "bg-primary text-primary-foreground",
                    )}
                  >
                    {lockedInThis ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </span>
                  <span className="text-xs leading-snug text-white/95 sm:text-sm">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {errorMsg ? (
            <p className="mt-2 text-xs font-medium text-red-300">{errorMsg}</p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 p-3 sm:p-4">
          <button
            type="button"
            onClick={handleContinue}
            className="flex w-full items-center justify-center rounded-[15px] bg-primary px-4 py-3 text-sm font-semibold text-foreground/70 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] transition-all hover:cursor-pointer hover:bg-purple-hover hover:text-white"
          >
            {!isAnswered ? L.checkAnswer : L.continueWatching}
          </button>
        </div>
      </div>
    </div>
  );
}
