import { useMemo, useState } from "react";
import { cn } from "../../../lib/utils";
import type { SentenceBuilderQuestion } from "../test-session.types";
import { grade_sentence, shuffle_chips } from "./sentence-builder.util";
import type { QuestionComponentProps } from "./question-component.types";

/**
 * Tap word chips into a drop zone to build the target phrase.
 */
export function SentenceBuilderQuestion({
  question,
  disabled,
  onAnswer,
}: QuestionComponentProps<SentenceBuilderQuestion>) {
  const shuffled = useMemo(
    () => shuffle_chips(question.wordChips),
    [question.wordChips],
  );
  const [built, setBuilt] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const targetWordCount = question.targetPhrase
    .split(/\s+/)
    .filter(Boolean).length;

  const handle_chip = (word: string, index: number): void => {
    if (disabled || submitted || usedIndices.has(index)) {
      return;
    }
    const nextBuilt = [...built, word];
    setBuilt(nextBuilt);
    setUsedIndices(new Set([...usedIndices, index]));
    if (nextBuilt.length >= targetWordCount) {
      setSubmitted(true);
      onAnswer({
        isCorrect: grade_sentence(nextBuilt, question.targetPhrase),
      });
    }
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

  return (
    <div className="flex min-h-full flex-col px-4 py-8">
      <p className="mb-6 text-center text-lg font-semibold text-muted-foreground">
        Зберіть фразу з наданих слів
      </p>
      <div className="mb-6 min-h-16 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-4">
        <div className="flex flex-wrap gap-2">
          {built.map((word, index) => (
            <button
              key={`${word}-${index}`}
              type="button"
              disabled={disabled || submitted}
              onClick={() => handle_remove(index)}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
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
      <div className="mt-auto flex flex-wrap justify-center gap-2">
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
    </div>
  );
}
