import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type TaskStepNavProps = {
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly stepLabel: string;
  readonly canGoBack: boolean;
  readonly canGoNext: boolean;
  readonly isLastStep: boolean;
  readonly completing: boolean;
  readonly lastStepLabel?: string;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly onComplete: () => void;
};

/**
 * Sticky footer with step progress and prev/next/complete actions.
 */
export function TaskStepNav({
  currentStep,
  totalSteps,
  stepLabel,
  canGoBack,
  canGoNext,
  isLastStep,
  completing,
  lastStepLabel = "Завершити",
  onBack,
  onNext,
  onComplete,
}: TaskStepNavProps) {
  const progressPct =
    totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-muted-foreground">
            {stepLabel}
          </span>
        </div>
        <div
          className="mb-4 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" />
            Назад
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={onComplete}
              disabled={completing}
              className="inline-flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 font-bold text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completing ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              ) : (
                <ChevronRight className="h-5 w-5 shrink-0" />
              )}
              {lastStepLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="inline-flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 font-bold text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Далі
              <ChevronRight className="h-5 w-5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
