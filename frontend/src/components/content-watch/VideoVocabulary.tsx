import { useState } from "react";
import { ChevronDown, Volume2, BookmarkPlus } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import { apiFetch } from "../../lib/api";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import type { VocabularyItem } from "./defaultLessonSides";

interface VideoVocabularyProps {
  vocabulary: VocabularyItem[];
}

function grayHintLine(item: VocabularyItem): string {
  const parts = [item.translation?.trim(), item.pronunciation?.trim()].filter(
    (p): p is string => Boolean(p && p.length > 0),
  );
  if (parts.length === 0) return "";
  return parts.join(" · ");
}

export function VideoVocabulary({ vocabulary }: VideoVocabularyProps) {
  const L = useAppMessages().lesson;
  const summary = useAppMessages().lessonSummaryPage;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});

  const handleSaveWord = async (index: number, item: VocabularyItem) => {
    setSavingStates((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await apiFetch("/auth/vocabulary", {
        method: "POST",
        body: JSON.stringify({
          term: item.word,
          translation: item.translation,
          meaning: item.meaning,
          pronunciation: item.pronunciation,
          language: "en",
        }),
      });
      if (response.ok) {
        toast.success(formatMessage(L.vocabSavedToast, { word: item.word }));
      } else {
        toast.error(L.vocabSaveError);
      }
    } catch {
      toast.error(L.vocabSaveError);
    } finally {
      setSavingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  if (vocabulary.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {L.vocabTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{L.vocabEmpty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {L.vocabTitle}
      </h3>

      {vocabulary.map((item, index) => {
        const gray = grayHintLine(item);
        const meaning = item.meaning?.trim() ?? "";

        return (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border"
            translate="no"
          >
            <div className="flex w-full items-center justify-between p-3 transition-colors hover:bg-muted/50">
              <div
                className="flex flex-1 items-center gap-3 hover:cursor-pointer"
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <span
                  className="rounded-full bg-primary/10 p-1.5 transition-colors hover:bg-primary/20"
                  aria-hidden
                >
                  <Volume2 className="h-4 w-4 text-primary" />
                </span>
                <span className="font-medium text-foreground">{item.word}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingStates[index]}
                  aria-label={L.saveWordAria}
                  onClick={() => handleSaveWord(index, item)}
                  className="rounded-md bg-secondary/50 p-1.5 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary disabled:opacity-50"
                >
                  <BookmarkPlus className="h-4 w-4" />
                </button>
                <ChevronDown
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className={cn(
                    "h-4 w-4 text-muted-foreground hover:cursor-pointer transition-transform",
                    expandedIndex === index && "rotate-180",
                  )}
                />
              </div>
            </div>

            {expandedIndex === index ? (
              <div className="space-y-2 px-3 pb-3">
                <div className="pl-10">
                  <p className="text-sm text-muted-foreground">
                    {gray || summary.answerDash}
                  </p>
                  <div className="mt-2 rounded-lg bg-muted/50 p-2">
                    <p className="text-sm leading-relaxed text-foreground" translate="yes">
                      {meaning || summary.answerDash}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
