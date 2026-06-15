import { useRef, useState } from "react";
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAppMessages } from "../hooks/useAppMessages";
import { use_email_verification_banner_offset } from "../hooks/use_email_verification_banner_offset";
import { apiFetch } from "../lib/api";

export function should_show_email_verification_banner(
  _isLoggedIn: boolean,
  _isVerified: boolean | undefined,
): boolean {
  return false;
}

export function EmailVerificationBanner() {
  const { user, isLoggedIn } = useUser();
  const b = useAppMessages().emailVerificationBanner;
  const [resendSent, setResendSent] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const isVisible = should_show_email_verification_banner(
    isLoggedIn,
    user?.isVerified,
  );

  use_email_verification_banner_offset(isVisible, bannerRef);

  if (!isVisible) {
    return null;
  }

  const handle_resend = async () => {
    if (!user?.email) return;
    try {
      const response = await apiFetch("/auth/resend-confirmation", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      if (response.ok) {
        setResendSent(true);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={bannerRef}
      role="status"
      className="sticky top-0 z-[1000] border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-sm text-foreground shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-amber-500/10 dark:bg-amber-950/80 dark:supports-[backdrop-filter]:bg-amber-950/70"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <AlertTriangle
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <span>{b.message}</span>
        <Link
          to="/verify-email"
          state={{ email: user?.email }}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          {b.confirmLink}
        </Link>
        <button
          type="button"
          onClick={() => void handle_resend()}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          {resendSent ? b.resendSent : b.resend}
        </button>
      </div>
    </div>
  );
}
