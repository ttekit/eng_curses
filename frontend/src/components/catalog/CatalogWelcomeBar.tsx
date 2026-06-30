import { Flame } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { Link } from "react-router";
import { cn } from "../../lib/utils";

export function CatalogWelcomeBar() {
  const { user } = useUser();
  const { messages } = useLandingLocale();
  const catalog = messages.catalogPage;

  if (!user) {
    return null;
  }

  const streak = user.currentStreak ?? 0;

  return (
    <div className="flex items-center justify-end px-4 py-3 sm:px-6 lg:px-8">
      <Link to="/profile?tab=activity">
        <div
          className={cn(
            "flex items-center justify-center gap-1 rounded-full hover:cursor-pointer px-2.5 py-1 text-orange-500",
            streak !== 0 && "bg-orange-500/35 text-orange-400",
            streak === 0 && "bg-orange-500/15 text-orange-500",
          )}
          aria-label={`${catalog.streakLabel}: ${streak}`}
          title={catalog.titleStreak}
        >
          <Flame className="size-5" aria-hidden />
          <span className="text-sm font-bold tabular-nums">{streak}</span>
        </div>
      </Link>
    </div>
  );
}
