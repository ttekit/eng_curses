import { useState } from "react";
import { cn } from "../../../lib/utils";
import type { TextPickQuestion } from "../test-session.types";
import { get_answer_option_classes } from "./answer-option-styles.util";
import type { QuestionComponentProps } from "./question-component.types";

/**
 * Text-only multiple choice question (no video or audio).
 */
export function TextPickQuestion({
  question,
  disabled,
  onAnswer,
}: QuestionComponentProps<TextPickQuestion>) {
  const [selected, setSelected] = useState<string | null>(null);
  const isInteractionLocked = disabled || Boolean(selected);

  const handle_select = (option: string): void => {
    if (isInteractionLocked) {
      return;
    }
    setSelected(option);
    onAnswer({ isCorrect: option === question.correctAnswer });
  };

  return (
    <div className="flex min-h-full flex-col px-4 py-8">
      {question.prompt ? (
        <p className="mb-8 text-center text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
          {question.prompt}
        </p>
      ) : null}
      <div className="mt-auto space-y-3">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            aria-disabled={isInteractionLocked}
            onClick={() => handle_select(option)}
            className={cn(
              "w-full rounded-2xl border-2 px-4 py-4 text-left text-lg font-semibold transition-all duration-200",
              get_answer_option_classes({
                option,
                selected,
                correctAnswer: question.correctAnswer,
              }),
              isInteractionLocked && "pointer-events-none",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
