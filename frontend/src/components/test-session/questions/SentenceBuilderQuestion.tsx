import { useMemo, useState } from "react";
import { cn } from "../../../lib/utils";
import type { SentenceBuilderQuestion as SentenceBuilderQuestionType } from "../test-session.types";
import { grade_sentence, shuffle_chips } from "./sentence-builder.util";
import type { QuestionComponentProps } from "./question-component.types";


export function SentenceBuilderQuestion({
  question,
  disabled,
  onAnswer,
}: QuestionComponentProps<SentenceBuilderQuestionType>) {
  const shuffled = useMemo(
    () => shuffle_chips(question.wordChips),
    [question.wordChips],
  );
  const [built, setBuilt] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handle_chip = (word: string, index: number): void => {
    if (disabled || submitted || usedIndices.has(index)) {
      return;
    }
    const nextBuilt = [...built, word];
    setBuilt(nextBuilt);
    setUsedIndices(new Set([...usedIndices, index]));
  };

  const handle_remove = (chipIndex: number): void => {
    if (disabled || submitted) {
      return;
    }
    const word = built[chipIndex];
    if (!word) {
      return;
    }
    const sourceIndex = shuffled.findIndex(
      (chip, index) => chip === word && usedIndices.has(index),
    );
    const nextUsed = new Set(usedIndices);
    if (sourceIndex >= 0) {
      nextUsed.delete(sourceIndex);
    }
    setUsedIndices(nextUsed);
    setBuilt(built.filter((_, index) => index !== chipIndex));
  };

  const handle_submit = () => {
    if (disabled || submitted || built.length === 0) return;

    setSubmitted(true);
    const correct = grade_sentence(built, question.targetPhrase);
    setIsCorrect(correct);
    onAnswer({ isCorrect: correct, userAnswer: built.join(" ") });
  };


  return (
    <div className="flex min-h-full flex-col px-4 py-8">
      <div className="mb-6 text-center">
        {question.prompt ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-400 mb-2">
              Перекладіть фразу
            </p>
            <p className="text-xl font-medium text-foreground">
              {question.prompt}
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-foreground">
              Зберіть правильну фразу
            </p>
            <p className="text-lg font-medium text-foreground">
              {question.prompt}
            </p>
          </>
        )}
      </div>

      <div
        className={cn(
          "mb-6 min-h-16 rounded-2xl border-2 p-4 transition-all duration-300",
          submitted && isCorrect
            ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            : submitted && isCorrect === false
              ? "border-destructive bg-destructive/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              : "border-dashed border-border bg-muted/20"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {built.map((word, index) => (
            <button
              key={`${word}-${index}`}
              type="button"
              disabled={disabled || submitted}
              onClick={() => handle_remove(index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300",
                submitted && isCorrect
                  ? "bg-emerald-500 hover:bg-emerald-500"
                  : submitted && isCorrect === false
                    ? "bg-destructive hover:bg-destructive"
                    : "bg-primary hover:bg-primary/80"
              )}
            >
              {word}
            </button>
          ))}
          {built.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Натисніть слова нижче…
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap justify-center gap-2 mb-8">
        {shuffled.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            disabled={disabled || submitted || usedIndices.has(index)}
            onClick={() => handle_chip(word, index)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              usedIndices.has(index)
                ? "border-transparent bg-muted/30 text-muted-foreground opacity-40"
                : "border-border bg-card hover:border-primary",
            )}
          >
            {word}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || submitted || built.length === 0}
        onClick={handle_submit}
        className="w-full mt-auto rounded-xl bg-purple-600 px-4 py-3.5 text-base font-bold text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        Перевірити
      </button>
    </div>
  );
}