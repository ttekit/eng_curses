import { useState } from "react";
import { BookOpen } from "lucide-react";
import { TestSessionEngine } from "../test-session/TestSessionEngine";
import type { TestQuestion } from "../test-session/test-session.types";

type ReadingLessonSectionProps = {
  readonly text: string;
  readonly questions: readonly TestQuestion[];
  readonly completing: boolean;
  readonly onComplete: () => void;
};

/**
 * Reading star: text intro then dynamic test session.
 */
export function ReadingLessonSection({
  text,
  questions,
  completing,
  onComplete,
}: ReadingLessonSectionProps) {
  const [phase, setPhase] = useState<"reading" | "quiz">("reading");

  if (phase === "quiz") {
    return (
      <TestSessionEngine
        questions={questions}
        completing={completing}
        onSessionComplete={onComplete}
      />
    );
  }

  const handleContinue = (): void => {
    if (questions.length === 0) {
      onComplete();
      return;
    }
    setPhase("quiz");
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-2xl border border-blue-500/20 bg-card p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Прочитайте текст</h2>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-6">
          <p className="whitespace-pre-wrap break-words font-serif text-lg leading-8 text-foreground">
            {text || "Текст відсутній."}
          </p>
        </div>
      </section>
      <button
        type="button"
        onClick={handleContinue}
        disabled={completing}
        className="w-full rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
      >
        {questions.length === 0 ? "Завершити урок" : "Почати перевірку"}
      </button>
    </div>
  );
}
