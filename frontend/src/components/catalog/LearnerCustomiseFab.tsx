import { Link } from "react-router";
import { CircleAlert } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { shouldShowLearnerCustomiseFab } from "../../lib/learnerCustomise";
import { useLocation } from "react-router";

export function LearnerCustomiseFab() {
  const { user } = useUser();
  const { pathname } = useLocation();
  const shell = useAppMessages().catalogShell;

  if (!shouldShowLearnerCustomiseFab(user, pathname)) {
    return null;
  }

  return (
    <Link
      to="/customise"
      className="fixed bottom-20 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] hover:bg-primary/90 lg:bottom-6 lg:right-6"
      aria-label={shell.navCustomise}
    >
      <CircleAlert className="size-5 sm:size-6 shrink-0" aria-hidden />
      <span className="text-xs sm:text-md inline">{shell.navCustomise}</span>
    </Link>
  );
}
