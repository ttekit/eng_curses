import { cn } from "../../lib/utils";
import { useLandingLocale } from "../../context/LandingLocaleContext";

type LandingLanguageToggleProps = {
  className?: string;
};

export function LandingLanguageToggle({
  className,
}: LandingLanguageToggleProps) {
  const { locale, setLocale } = useLandingLocale();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-full border border-border bg-muted/30 p-0.5",
        className,
      )}
      role="group"
      aria-label="Language / Мова"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
          locale === "en"
            ? "bg-primary font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
            : "text-foreground/70 hover:text-white items-center justify-center hover:cursor-pointer gap-2 rounded-xlpx-8 font-semibold transition-colors hover:bg-muted-foreground/10",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("uk")}
        className={cn(
          "rounded-full flex px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
          locale === "uk"
            ? "bg-primary font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
            : "text-foreground/70 hover:text-white hover:cursor-pointer items-center justify-center gap-2 rounded-xlpx-8 font-semibold transition-colors hover:bg-muted-foreground/10",
        )}
      >
        UA
      </button>
    </div>
  );
}
