import type { VocabularyHint } from "../../lib/srsApi";
import type { WordHintStatus } from "./useWordHint";

type WordReviewModalProps = {
  word: string;
  hint: VocabularyHint | null;
  hintStatus: WordHintStatus;
  isSubmitting: boolean;
  onKnow: () => void;
  onLearning: () => void;
  onClose: () => void;
};

export default function WordReviewModal({
  word,
  hint,
  hintStatus,
  isSubmitting,
  onKnow,
  onLearning,
  onClose,
}: WordReviewModalProps) {
  const translation = hint?.translation?.trim() ?? null;
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/55 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950/95 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Word review
            </p>
            <h3 className="text-2xl font-semibold text-white">{word}</h3>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mb-5 text-sm text-zinc-200">
          {hintStatus === "loading" ? (
            <p className="text-zinc-400">Loading translation…</p>
          ) : null}
          {hintStatus === "error" ? (
            <p className="text-zinc-400">Could not load translation.</p>
          ) : null}
          {hintStatus === "ready" && translation ? (
            <p className="text-lg">{translation}</p>
          ) : null}
          {hintStatus === "ready" && !translation ? (
            <p className="text-zinc-400">Translation unavailable.</p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            onClick={onKnow}
          >
            I know it
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
            onClick={onLearning}
          >
            Still learning
          </button>
        </div>
      </div>
    </div>
  );
}
