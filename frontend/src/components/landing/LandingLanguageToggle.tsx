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
        "flex shrink-0 items-center rounded-full border border-border bg-muted/30 p-1",
        className,
      )}
      role="group"
      aria-label="Language / Мова"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm cursor-pointer",
          locale === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("uk")}
        className={cn(
          "flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm cursor-pointer",
          locale === "uk"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        UK
      </button>
    </div>
  );
}
