import { CheckCircle2, Loader2 } from "lucide-react";

type TaskCompleteButtonProps = {
  readonly completing: boolean;
  readonly disabled: boolean;
  readonly onComplete: () => void;
};

export function TaskCompleteButton({
  completing,
  disabled,
  onComplete,
}: TaskCompleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onComplete}
      disabled={completing || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 font-bold text-white transition-all hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {completing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <CheckCircle2 className="h-5 w-5" />
      )}
      Завершити та продовжити
    </button>
  );
}
