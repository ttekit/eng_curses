import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

type StarLoadingScreenProps = {
  readonly starName?: string;
};

const LOADING_PHRASES = [
  "Готуємо ваш урок…",
  "Шукаємо зірку в небі…",
  "Підбираємо фрази…",
  "Створюємо цікаві завдання…",
  "Майже готово…"
];

export function StarLoadingScreen({
  starName,
}: StarLoadingScreenProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % LOADING_PHRASES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10">
          <Sparkles className="h-9 w-9 text-purple-400" />
        </div>
      </div>
      {starName ? (
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
          {starName}
        </h2>
      ) : null}
      <p className="mb-6 max-w-sm text-base text-muted-foreground transition-opacity">
        {LOADING_PHRASES[phraseIndex]}
      </p>
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
    </div>
  );
}