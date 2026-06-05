import { useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import type { TranscriptLine, VocabularyItem } from "./defaultLessonSides";
import { X } from "lucide-react";

interface VideoTranscriptProps {
  transcript: TranscriptLine[];
  loading?: boolean;
  playbackSec?: number;
  onSeek?: (seconds: number) => void;
  vocabulary?: VocabularyItem[];
}

function activeCueIndex(
  transcript: TranscriptLine[],
  t: number | undefined,
): number {
  if (t === undefined || !Number.isFinite(t) || transcript.length === 0) {
    return -1;
  }
  for (let i = 0; i < transcript.length; i++) {
    const s = transcript[i]!.startSec;
    const e = transcript[i]!.endSec;
    if (s == null || e == null) {
      continue;
    }
    if (t >= s && t < e) {
      return i;
    }
  }
  return -1;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({
  text,
  vocabulary,
  onWordClick,
}: {
  text: string;
  vocabulary: VocabularyItem[];
  onWordClick: (word: VocabularyItem) => void;
}) {
  if (!vocabulary || vocabulary.length === 0) return <>{text}</>;

  const pattern = useMemo(() => {
    const escaped = vocabulary
      .map((v) => escapeRegExp(v.word.trim()))
      .filter((w) => w.length > 0)
      .sort((a, b) => b.length - a.length);

    if (!escaped.length) return null;
    return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  }, [vocabulary]);

  if (!pattern) return <>{text}</>;

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const matchedWord = vocabulary.find(
            (v) => v.word.toLowerCase() === part.toLowerCase()
          );
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (matchedWord) onWordClick(matchedWord);
              }}
              className="rounded bg-green-500/15 px-0.5 font-semibold text-green-500 transition-colors hover:bg-green-500/30 cursor-pointer"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function VideoTranscript({
  transcript,
  loading,
  playbackSec,
  onSeek,
  vocabulary = [],
}: VideoTranscriptProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);

  const activeIndex = useMemo(
    () => activeCueIndex(transcript, playbackSec),
    [transcript, playbackSec],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Transcript
        </h3>
        <p className="text-center text-sm text-muted-foreground">
          Loading captions…
        </p>
      </div>
    );
  }

  if (transcript.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Transcript
        </h3>
        <p className="text-sm text-muted-foreground">
          Captions will appear here after this lesson has WebVTT generated on
          the server.
        </p>
      </div>
    );
  }

  const seeks = typeof onSeek === "function";

  return (
    <div className="space-y-4 relative">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Transcript</h3>

      <div ref={listRef} className="space-y-2 relative">
        {transcript.map((line, index) => {
          const canSeek = seeks && typeof line.startSec === "number";
          const highlighted = activeIndex === index;
          return (
            <button
              key={`${index}-${line.time}-${line.text.slice(0, 24)}`}
              type="button"
              data-cue-index={index}
              disabled={!canSeek}
              title={canSeek ? "Seek to this line" : undefined}
              onClick={() => canSeek && onSeek!(line.startSec!)}
              className={cn(
                "flex w-full cursor-default gap-3 rounded-lg p-2 text-left transition-colors relative",
                canSeek && "cursor-pointer hover:bg-muted/50",
                highlighted && "bg-primary/15 ring-2 ring-primary/25",
              )}
            >
              <span className="shrink-0 pt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                {line.time}
              </span>
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
                <HighlightedText
                  text={line.text}
                  vocabulary={vocabulary}
                  onWordClick={setSelectedWord}
                />
              </p>
            </button>
          );
        })}
      </div>

      {selectedWord && (
        <div className="sticky bottom-4 left-0 right-0 z-10 mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-bold text-foreground">
                {selectedWord.word}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedWord(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {[selectedWord.translation?.trim(), selectedWord.pronunciation?.trim()]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>

            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-sm leading-relaxed text-foreground">
                {selectedWord.meaning || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {onSeek !== undefined &&
        transcript.some((l) => typeof l.startSec === "number") ? (
        <p className="pt-4 text-center text-xs text-muted-foreground">
          The highlighted line follows playback. Tap a cue to jump in the clip.
        </p>
      ) : (
        <p className="pt-4 text-center text-xs text-muted-foreground">
          Tip: follow along aloud to mimic rhythm and tone.
        </p>
      )}
    </div>
  );
}