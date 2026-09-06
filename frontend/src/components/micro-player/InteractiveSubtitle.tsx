import type { FeedToken } from "../../lib/srsApi";

type InteractiveSubtitleProps = {
  fullPhrase: string;
  tokens: FeedToken[];
  onWordClick: (token: FeedToken) => void;
};

function splitPhrase(fullPhrase: string): string[] {
  return fullPhrase.match(/[\p{L}\p{N}'-]+|[^\p{L}\p{N}\s]+|\s+/gu) ?? [fullPhrase];
}

export default function InteractiveSubtitle({
  fullPhrase,
  tokens,
  onWordClick,
}: InteractiveSubtitleProps) {
  const markedToken = tokens[0] ?? null;
  const markedPosition = markedToken?.position ?? -1;
  const parts = splitPhrase(fullPhrase);
  let wordIndex = 0;
  return (
    <p className="pointer-events-auto max-w-[92%] text-center text-xl font-semibold leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-2xl">
      {parts.map((part, index) => {
        const isWord = /^[\p{L}\p{N}'-]+$/u.test(part);
        if (!isWord) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        const currentIndex = wordIndex;
        wordIndex += 1;
        if (!markedToken || currentIndex !== markedPosition) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        return (
          <button
            key={`${markedToken.lemmaId}-${index}`}
            type="button"
            className="mx-0.5 rounded px-1 underline decoration-white/40 underline-offset-4 transition hover:bg-white/15 hover:decoration-white"
            onClick={(event) => {
              event.stopPropagation();
              onWordClick(markedToken);
            }}
          >
            {part}
          </button>
        );
      })}
    </p>
  );
}
