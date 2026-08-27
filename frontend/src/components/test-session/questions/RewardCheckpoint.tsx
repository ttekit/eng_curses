import { QuestionType } from "../test-session.types";
import type { RewardCheckpointQuestion } from "../test-session.types";

type RewardCheckpointProps = {
  readonly question: RewardCheckpointQuestion;
  readonly onContinue: () => void;
};

/**
 * Rest screen with encouragement message and continue button.
 */
export function RewardCheckpoint({
  question,
  onContinue,
}: RewardCheckpointProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
      <p className="mb-8 text-3xl font-bold text-foreground">
        {question.message}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-2xl bg-emerald-500 px-10 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
      >
        Continue
      </button>
    </div>
  );
}

/**
 * Engine-injected checkpoint (not from question data).
 */
export function InjectedRewardCheckpoint({
  onContinue,
}: {
  readonly onContinue: () => void;
}) {
  return (
    <RewardCheckpoint
      question={{
        id: "injected-checkpoint",
        type: QuestionType.REWARD_CHECKPOINT,
        message: "Great pace! Keep going!",
      }}
      onContinue={onContinue}
    />
  );
}
