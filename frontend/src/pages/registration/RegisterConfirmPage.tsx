import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import toast from "react-hot-toast";

import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import Button from "../../components/Button";
import ValidateError from "../../components/ValidateError";
import { apiFetch } from "../../lib/api";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function EmailConfirmationPage() {
  const { messages } = useLandingLocale();
  const t = messages.auth.emailCheckInbox;
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "you@example.com";

  const [isChecking, setIsChecking] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const checkStatus = async () => {
    try {
      navigate("/loginForm", {
        state: {
          message: t.confirmedLoginMessage,
        },
      });
      return true;
    } catch (error) {
      console.error("Email check error:", error);
      return false;
    }
  };

  const handleContinue = async () => {
    setIsChecking(true);
    setShowError(false);
    const isConfirmed = await checkStatus();
    if (!isConfirmed) {
      setShowError(true);
    } else {
      toast.success(t.confirmedToast);
    }
    setIsChecking(false);
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);

    try {
      const response = await apiFetch("/auth/resend-confirmation", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t.resendSuccess);
      } else {
        toast.error(result.message || t.resendFailed);
      }
    } catch {
      toast.error(t.resendNetworkError);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthSplitLayout rightTitle={t.rightTitle} rightSubtitle={t.rightSubtitle}>
      <div className="flex flex-col justify-center h-full text-foreground">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🦎</span>
          <span className="font-bold text-lg">{t.welcomeBack}</span>
        </div>

        <h1 className="text-3xl font-bold font-display mb-3">{t.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {t.leadPrefix} <br />
          <strong className="text-foreground font-medium">{email}</strong>
        </p>

        {showError && (
          <div className="mb-6 animate-pulse">
            <ValidateError>{t.notConfirmedError}</ValidateError>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={isChecking}
          className="w-full py-6 text-base font-semibold"
        >
          {isChecking ? t.checking : t.continue}
        </Button>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {t.resendPrompt}{" "}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-primary hover:underline font-medium bg-transparent border-none cursor-pointer disabled:opacity-50"
            >
              {isResending ? t.resending : t.resend}
            </button>
          </span>
          <Link
            to="/loginForm"
            className="text-muted-foreground hover:text-foreground transition-colors self-start flex items-center gap-2 mt-4"
          >
            {t.backToLogin}
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
