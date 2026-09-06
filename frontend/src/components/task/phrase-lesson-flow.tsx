import { useState } from "react";
import { PenTool } from "lucide-react";
import { TestSessionEngine } from "../test-session/TestSessionEngine";
import type { TestQuestion } from "../test-session/test-session.types";
import type { PhraseItem } from "../../pages/content/task-page.types";
import { format_phrase_dialogue } from "./format-phrase-dialogue.util";
import { TaskStepNav } from "./task-step-nav";

type PhraseLessonFlowProps = {
  readonly phrases: readonly PhraseItem[];
  readonly questions: readonly TestQuestion[];
  readonly completing: boolean;
  readonly onComplete: () => void;
};

/**
 * Phrase star: browse phrases, then dynamic test session.
 */
export function PhraseLessonFlow({
  phrases,
  questions,
  completing,
  onComplete,
}: PhraseLessonFlowProps) {
  const [phase, setPhase] = useState<"intro" | "quiz">("intro");
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = Math.max(phrases.length, 1);
  const currentPhrase = phrases[currentStep];
  const dialogueLines = currentPhrase?.dialogue
    ? format_phrase_dialogue(currentPhrase.dialogue)
    : [];

  if (phase === "quiz") {
    return (
      <TestSessionEngine
        questions={questions}
        completing={completing}
        onSessionComplete={onComplete}
        completionMessage="Вітаємо! Ви опанували базові фрази. Тепер ви можете впевнено розповісти про себе!"
      />
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl pb-36">
        <section className="rounded-2xl border border-emerald-500/20 bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
              <PenTool className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Вивчіть фрази</h2>
              <p className="text-sm text-muted-foreground">
                Фраза {currentStep + 1} з {totalSteps}
              </p>
            </div>
          </div>
          {currentPhrase ? (
            <article className="rounded-xl border border-border bg-background p-5 sm:p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Фраза {currentStep + 1}
              </p>
              <p className="break-words text-2xl font-bold text-emerald-400 sm:text-3xl">
                {currentPhrase.targetPhrase}
              </p>
              <p className="mt-3 text-lg text-foreground">{currentPhrase.translation}</p>
              {currentPhrase.context ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {currentPhrase.context}
                </p>
              ) : null}
              {dialogueLines.length > 0 ? (
                <div className="mt-4 space-y-2 rounded-xl border border-border/80 bg-muted/20 p-4">
                  {dialogueLines.map((line, lineIndex) => (
                    <p
                      key={lineIndex}
                      className="text-sm leading-relaxed text-foreground"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
            </article>
          ) : (
            <p className="text-muted-foreground">Фрази відсутні.</p>
          )}
        </section>
      </div>
      <TaskStepNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabel={`Фраза ${currentStep + 1}`}
        canGoBack={currentStep > 0}
        canGoNext={currentStep < totalSteps - 1}
        isLastStep={currentStep === totalSteps - 1}
        completing={completing}
        onBack={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentStep((prev) => prev + 1)}
        onComplete={() => setPhase("quiz")}
        lastStepLabel="Почати практику"
      />
    </>
  );
}
