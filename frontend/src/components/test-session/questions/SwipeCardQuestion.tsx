import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { cn } from "../../../lib/utils";
import type { SwipeCardQuestion } from "../test-session.types";
import type { QuestionComponentProps } from "./question-component.types";

const SWIPE_THRESHOLD = 120;

/**
 * Tinder-style swipe cards — right if match, left if not.
 */
export function SwipeCardQuestion({
  question,
  disabled,
  onAnswer,
}: QuestionComponentProps<SwipeCardQuestion>) {
  const [cardIndex, setCardIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const currentCard = question.cards[cardIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  const finish_if_done = (nextResults: boolean[]): void => {
    if (nextResults.length >= question.cards.length) {
      const allCorrect = nextResults.every(Boolean);
      onAnswer({ isCorrect: allCorrect });
    }
  };

  const handle_swipe = (direction: "left" | "right"): void => {
    if (disabled || !currentCard) {
      return;
    }
    const swipedRight = direction === "right";
    const isCorrect = swipedRight === currentCard.isMatch;
    const nextResults = [...results, isCorrect];
    setResults(nextResults);
    setCardIndex((prev) => prev + 1);
    x.set(0);
    finish_if_done(nextResults);
  };

  const handle_drag_end = (_: unknown, info: PanInfo): void => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      handle_swipe("right");
      return;
    }
    if (info.offset.x < -SWIPE_THRESHOLD) {
      handle_swipe("left");
    }
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        onDragEnd={handle_drag_end}
        className="relative w-full max-w-sm cursor-grab active:cursor-grabbing"
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          {currentCard.thumbnailUrl ? (
            <img
              src={currentCard.thumbnailUrl}
              alt=""
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-purple-600/40 to-blue-600/30">
              <span className="text-4xl font-bold text-white">{currentCard.word}</span>
            </div>
          )}
          <div className="p-6 text-center">
            <p className="text-3xl font-bold text-foreground">{currentCard.word}</p>
            <p className="mt-2 text-muted-foreground">{currentCard.hint}</p>
          </div>
        </div>
      </motion.div>
      <div className="mt-8 flex w-full max-w-sm gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handle_swipe("left")}
          className={cn(
            "flex-1 rounded-xl border border-destructive/50 py-3 font-semibold text-destructive",
            "hover:bg-destructive/10",
          )}
        >
          Wrong
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handle_swipe("right")}
          className={cn(
            "flex-1 rounded-xl border border-emerald-500/50 py-3 font-semibold text-emerald-500",
            "hover:bg-emerald-500/10",
          )}
        >
          Match
        </button>
      </div>
    </div>
  );
}
