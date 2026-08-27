import { useMemo, useState } from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { TestSessionEngine } from "../test-session/TestSessionEngine";
import type { TestQuestion } from "../test-session/test-session.types";
import { TaskStepNav } from "./task-step-nav";

type GrammarExample = { en: string; uk: string };

type GrammarLessonFlowProps = {
  readonly rule: string;
  readonly examples: GrammarExample[];
  readonly questions: readonly TestQuestion[];
  readonly completing: boolean;
  readonly onComplete: () => void;
};

function parse_rule_sections(rule: string): string[] {
  return rule
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

/**
 * Grammar star: rule → examples → dynamic test session.
 */
export function GrammarLessonFlow({
  rule,
  examples,
  questions,
  completing,
  onComplete,
}: GrammarLessonFlowProps) {
  const [phase, setPhase] = useState<"intro" | "quiz">("intro");
  const [currentStep, setCurrentStep] = useState(0);
  const ruleSections = useMemo(() => parse_rule_sections(rule), [rule]);
  const totalSteps = 2;

  if (phase === "quiz") {
    return (
      <TestSessionEngine
        questions={questions}
        completing={completing}
        onSessionComplete={onComplete}
      />
    );
  }

  const stepLabel = currentStep === 0 ? "Правило" : "Приклади";
  const canGoNext = true;

  return (
    <>
      <div className="mx-auto max-w-2xl pb-36">
        {currentStep === 0 && (
          <section className="rounded-2xl border border-purple-500/20 bg-card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/15">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Правило</h2>
            </div>
            <div className="space-y-4">
              {ruleSections.map((section, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/80 bg-muted/25 p-5"
                >
                  <p className="whitespace-pre-wrap text-base leading-8 text-foreground sm:text-lg">
                    {section}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentStep === 1 && (
          <section className="rounded-2xl border border-purple-500/20 bg-card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/15">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Приклади</h2>
            </div>
            <div className="space-y-4">
              {examples.map((example, index) => (
                <article
                  key={index}
                  className="rounded-xl border border-border bg-background p-5"
                >
                  <p className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                    {example.en}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {example.uk}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <TaskStepNav
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabel={stepLabel}
        canGoBack={currentStep > 0}
        canGoNext={canGoNext}
        isLastStep={currentStep === totalSteps - 1}
        completing={completing}
        onBack={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentStep((prev) => prev + 1)}
        onComplete={() => setPhase("quiz")}
        lastStepLabel="Почати тест"
      />
    </>
  );
}
