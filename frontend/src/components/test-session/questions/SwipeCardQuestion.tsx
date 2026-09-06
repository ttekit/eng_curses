import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { cn } from "../../../lib/utils";
import type { SwipeCardQuestion } from "../test-session.types";
import type { QuestionComponentProps } from "./question-component.types";

const SWIPE_THRESHOLD = 120;
const TIME_LIMIT = 45;

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
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const currentCard = question.cards[cardIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  useEffect(() => {
    if (disabled || !currentCard) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const remainingCount = question.cards.length - results.length;
          const nextResults = [...results, ...Array(remainingCount).fill(false)];
          setResults(nextResults);
          onAnswer({ isCorrect: false, userAnswer: "Час вийшов" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disabled, currentCard, results, question.cards.length, onAnswer]);

  const finish_if_done = (nextResults: boolean[]): void => {
    if (nextResults.length >= question.cards.length) {
      const allCorrect = nextResults.every(Boolean);
      const userSummary = question.cards
        .map((c, idx) => `${c.word}: ${nextResults[idx] ? "Вірно" : "Помилка"}`)
        .join(", ");
      onAnswer({ isCorrect: allCorrect, userAnswer: userSummary });
    }
  };

  const handle_swipe = (direction: "left" | "right"): void => {
    if (disabled || !currentCard || timeLeft === 0) {
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

  if (!currentCard && timeLeft > 0) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mb-6 flex flex-col items-center">
        <div className="flex justify-between w-full text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          <span>Час: 00:{timeLeft.toString().padStart(2, '0')}</span>
          <span className="text-purple-400">Залишилось: {question.cards.length - cardIndex}</span>
        </div>
        <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              timeLeft < 10 ? "bg-destructive" : "bg-purple-500"
            )}
            style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
          />
        </div>
      </div>

      {currentCard ? (
        <motion.div
          drag={disabled || timeLeft === 0 ? false : "x"}
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
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-purple-900/60 to-slate-900">
                <span className="text-4xl font-bold text-white">{currentCard.word}</span>
              </div>
            )}
            <div className="p-6 text-center bg-background/50 backdrop-blur-sm">
              <p className="text-3xl font-bold text-foreground">{currentCard.word}</p>
              <p className="mt-2 text-lg text-muted-foreground">{currentCard.hint}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center text-muted-foreground font-semibold">Завдання завершено!</div>
      )}

      {currentCard && (
        <div className="mt-8 flex w-full max-w-sm gap-3">
          <button
            type="button"
            disabled={disabled || timeLeft === 0}
            onClick={() => handle_swipe("left")}
            className={cn(
              "flex-1 rounded-xl border border-destructive/50 py-3 font-semibold text-destructive transition-colors",
              "hover:bg-destructive/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
            )}
          >
            Wrong
          </button>
          <button
            type="button"
            disabled={disabled || timeLeft === 0}
            onClick={() => handle_swipe("right")}
            className={cn(
              "flex-1 rounded-xl border border-emerald-500/50 py-3 font-semibold text-emerald-500 transition-colors",
              "hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]",
            )}
          >
            Match
          </button>
        </div>
      )}
    </div>
  );
}