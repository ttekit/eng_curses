import { Flame } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export function CatalogWelcomeBar() {
  const { user } = useUser();
  const { messages } = useLandingLocale();
  const catalog = messages.catalogPage;
  if (!user) {
    return null;
  }
  const firstName = user.name?.trim().split(/\s+/)[0] || catalog.welcomeFallback;
  const streak = user.currentStreak ?? 0;
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs leading-none text-muted-foreground">
          {catalog.welcomeBack}
        </p>
        <p className="text-sm font-semibold text-foreground">{firstName}</p>
      </div>
      <div
        className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-orange-500"
        aria-label={`${catalog.streakLabel}: ${streak}`}
      >
        <Flame className="size-3.5" aria-hidden />
        <span className="text-xs font-bold tabular-nums">{streak}</span>
      </div>
    </div>
  );
}
