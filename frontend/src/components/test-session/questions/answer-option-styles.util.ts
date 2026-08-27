type AnswerOptionStyleInput = {
  readonly option: string;
  readonly selected: string | null;
  readonly correctAnswer: string;
};

type AnswerOptionVariant = "card" | "video";

const BASE_INTERACTION =
  "cursor-pointer select-none disabled:pointer-events-none disabled:opacity-100";

/**
 * Returns Tailwind classes for mcq option states after answering.
 */
export function get_answer_option_classes(
  input: AnswerOptionStyleInput,
  variant: AnswerOptionVariant = "card",
): string {
  const { option, selected, correctAnswer } = input;
  const hasAnswered = selected !== null;
  const isSelected = selected === option;
  const isCorrectOption = option === correctAnswer;

  if (!hasAnswered) {
    return variant === "video"
      ? `${BASE_INTERACTION} border-white/35 bg-black/60 text-white hover:bg-black/80`
      : `${BASE_INTERACTION} border-white/20 bg-zinc-900/90 text-zinc-100 hover:border-purple-400/60 hover:bg-zinc-800/90`;
  }
  if (isCorrectOption) {
    return `${BASE_INTERACTION} border-emerald-400 bg-emerald-500/30 text-emerald-50 shadow-[0_0_24px_rgba(52,211,153,0.35)]`;
  }
  if (isSelected) {
    return `${BASE_INTERACTION} border-red-400 bg-red-500/30 text-red-50 shadow-[0_0_24px_rgba(248,113,113,0.35)]`;
  }
  return variant === "video"
    ? `${BASE_INTERACTION} border-white/10 bg-black/40 text-white/50`
    : `${BASE_INTERACTION} border-zinc-700/70 bg-zinc-950/60 text-zinc-500`;
}

export { BASE_INTERACTION };
