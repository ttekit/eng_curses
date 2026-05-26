import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import {
  setStoredAccessToken,
  apiFetch,
  readApiErrorBody,
} from "../../lib/api";
import { maskEmail } from "../../lib/formatters";

import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import InputText from "../../components/InputText";
import LabelRegister from "../../components/LabelRegister";
import Button from "../../components/Button";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { userMayUseLearnerApp } from "../../lib/subscriptionAccess";

export const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useUser();
  const { messages } = useLandingLocale();
  const loginSeo = messages.auth.login;

  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (!email) {
      navigate("/registrationMain");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorText("Please enter the 6-digit code.");
      return;
    }

    setErrorText("");
    setLoading(true);

    try {
      const response = await apiFetch("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        const data = await response.json();

        setStoredAccessToken(data.access_token);

        const profile = await refreshProfile();

        const isLoginFlow = (location.state as any)?.isLoginFlow;
        if (isLoginFlow) {
          toast.success("Email verified! Welcome back.");
        }

        if (!profile) {
          navigate("/subscribe");
          return;
        }
        const savedStudents = location.state?.generatedStudents || [];
        if (savedStudents.length > 0) {
          navigate("/registrationSuccess", {
            state: { generatedStudents: savedStudents },
          });
          return;
        }
        if (
          !profile.role ||
          profile.role === "choose" ||
          profile.role === "regular"
        ) {
          navigate("/registrationDetails");
          return;
        }

        if (profile.role === "admin") {
          navigate("/admin");
          return;
        }
        if (profile.role === "teacher") {
          navigate("/catalog");
          return;
        }

        if (
          (!profile.favoriteGenres || profile.favoriteGenres.length === 0) &&
          (!profile.hatedGenres || profile.hatedGenres.length === 0)
        ) {
          navigate("/registrationPreferences");
          return;
        }

        if (!profile.subscriptionPlan && !profile.subscriptionStatus) {
          navigate("/subscribe");
          return;
        }

        if (
          !profile.englishLevel ||
          profile.englishLevel === "choose" ||
          profile.englishLevel === ""
        ) {
          navigate("/registrationDetails");
          return;
        }

        if (!profile.hasCompletedPlacement) {
          navigate("/level-test");
          return;
        }

        if (userMayUseLearnerApp(profile)) {
          navigate("/catalog");
        } else {
          navigate("/subscribe");
        }
      } else {
        const errorMsg = await readApiErrorBody(response);
        setErrorText(errorMsg || "Invalid verification code");
      }
    } catch (err) {
      setErrorText("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorText("");
    setResendMessage("");

    try {
      const response = await apiFetch("/auth/resend-confirmation", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendMessage("New code successfully sent!");
        setTimer(59);
      } else {
        const errorMsg = await readApiErrorBody(response);
        setErrorText(errorMsg || "Failed to resend code");
      }
    } catch {
      setErrorText("Error while resending code");
    }
  };

  return (
    <>
      <AuthPageSeo
        title={loginSeo.seoTitle}
        description={loginSeo.seoDescription}
        path="/verify-email"
      />
      <AuthSplitLayout
        rightTitle="Almost there!"
        rightSubtitle="Verify your email to start your personalized learning path."
      >
        <div className="mb-2 flex items-center gap-3">
          <img src="/Icon.svg" className="w-12 h-15" alt="Logo" />
          <h1 className="font-display text-2xl font-bold">Check your email</h1>
        </div>

        <p className="mb-8 text-sm text-muted-foreground">
          We sent a 6-digit code to <br />
          <span className="font-medium text-primary">{maskEmail(email)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorText && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
              {errorText}
            </div>
          )}
          {resendMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
              {resendMessage}
            </div>
          )}

          <div className="space-y-2">
            <LabelRegister isRequired={true}>Verification Code</LabelRegister>
            <InputText
              name="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (errorText) setErrorText("");
              }}
              type="text"
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em]"
              autoComplete="one-time-code"
              disabled={loading}
            />
          </div>

          <div className="flex justify-center pt-2">
            {timer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in {timer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
              >
                Resend code
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        <Link
          to="/registrationMain"
          className="mt-8 inline-block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to registration
        </Link>
      </AuthSplitLayout>
    </>
  );
};
