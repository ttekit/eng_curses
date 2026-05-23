import Button from "../../components/Button";
import InputText from "../../components/InputText";
import LabelRegister from "../../components/LabelRegister";
import ValidateError from "../../components/ValidateError";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Turnstile from "react-turnstile";
import { apiFetch, setStoredAccessToken } from "../../lib/api";
import type { UserData } from "../../context/UserContext";
import { useUser } from "../../context/UserContext";
import { userMayUseLearnerApp } from "../../lib/subscriptionAccess";
import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import { consumePendingRegistrationLoginWelcome } from "../../lib/registrationStorage";
import { maskEmail } from "../../lib/formatters";

function safeReturnPath(state: unknown): string | undefined {
  if (!state || typeof state !== "object" || !("from" in state))
    return undefined;
  const raw = (state as { from?: unknown }).from;
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  if (raw === "/loginForm" || raw.startsWith("/loginForm?")) return undefined;
  return raw;
}

function postLoginNavigateTarget(
  explicit: string | undefined,
  profile: UserData | null,
): string {
  if (explicit) return explicit;
  if (!profile) return "/subscribe";
  if (profile.role === "admin") return "/admin";
  if (profile.role === "teacher") return "/catalog";
  if (userMayUseLearnerApp(profile)) return "/catalog";
  return "/subscribe";
}

export default function LoginForm() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState<number>(0);
  const [emptyError, setEmptyError] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useUser();

  useEffect(() => {
    const s = location.state as {
      registrationComplete?: boolean;
      from?: string;
    } | null;
    if (!s?.registrationComplete) {
      return;
    }
    if (consumePendingRegistrationLoginWelcome()) {
      toast.success("Account created. Sign in with your email and password.");
    }
    navigate("/loginForm", {
      replace: true,
      state: s.from ? { from: s.from } : undefined,
    });
  }, [location.state, navigate]);

  const isEmpty = !show2FA
    ? [loginData.email, loginData.password].some((value) => value.trim() === "")
    : twoFactorCode.length !== 6;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!show2FA && !captchaToken) {
      toast.error("Please wait for captcha verification.");
      return;
    }

    if (!isEmpty) {
      setEmptyError(false);
      try {
        const endpoint = show2FA ? "/auth/verify-2fa" : "/auth/login";

        const bodyPayload = {
          ...loginData,
          ...(show2FA ? { code: twoFactorCode } : { captchaToken }),
        };

        const response = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(bodyPayload),
        });

        if (response.ok) {
          const data = await response.json();

          if (data.requiresTwoFactor) {
            setShow2FA(true);
            toast.success("Verification code sent to your email.");

            setCaptchaToken(null);
            setCaptchaKey((prev) => prev + 1);
            return;
          }

          const token = data.access_token;
          const fromState = safeReturnPath(location.state);

          if (!token) {
            const next = postLoginNavigateTarget(fromState, null);
            toast.success("Signed in successfully.");
            navigate(next);
          } else {
            setStoredAccessToken(token);
            const profile = await refreshProfile();
            const next = postLoginNavigateTarget(fromState, profile);
            toast.success("Signed in successfully.");
            navigate(next);
          }
        } else {
          const errorData = await response.json();

          if (!show2FA) {
            setCaptchaToken(null);
            setCaptchaKey((prev) => prev + 1);
          }

          if (errorData?.error === "EMAIL_NOT_VERIFIED") {
            toast.error("Please verify your email to continue.");
            navigate("/verify-email", {
              state: { email: loginData.email, isLoginFlow: true },
            });
          } else {
            toast.error(errorData?.message || "Could not sign in");
          }
        }
      } catch (error) {
        if (!show2FA) {
          setCaptchaToken(null);
          setCaptchaKey((prev) => prev + 1);
        }

        toast.error("Network error. Please try again later.");
      }
    } else {
      setEmptyError(true);
    }
  };

  return (
    <AuthSplitLayout
      rightTitle="Ready to continue?"
      rightSubtitle="Pick up right where you left off with your personalized learning path."
    >
      <div className="mb-2 flex items-center gap-3">
        <img src="/Icon.svg" className="w-12 h-15" alt="Logo" />
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
      </div>
      <p className="mb-8 text-muted-foreground">
        Continue your learning journey
      </p>

      <form onSubmit={handleLogin} tabIndex={0} className="space-y-5">
        {!show2FA ? (
          <>
            <div className="space-y-2">
              <LabelRegister isRequired={true}>Email</LabelRegister>
              <InputText
                name="email"
                value={loginData.email}
                onChange={handleChange}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <LabelRegister isRequired={true}>Password</LabelRegister>
                <Link
                  to="#"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <InputText
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="hover:cursor-pointer size-5 opacity-70" />
                  ) : (
                    <Eye className="hover:cursor-pointer size-5 opacity-70" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <br />
                <span className="font-medium text-primary">
                  {maskEmail(loginData.email)}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <LabelRegister isRequired={true}>Verification Code</LabelRegister>
              <InputText
                name="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                type="text"
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em]"
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setShow2FA(false);
                  setTwoFactorCode("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to login
              </button>
            </div>
          </div>
        )}

        {!show2FA && (
          <div className="flex justify-center py-2">
            <Turnstile
              key={captchaKey}
              sitekey="0x4AAAAAADSk3etSiWLwGH5-"
              onVerify={(token) => setCaptchaToken(token)}
              onLoad={() => console.log("Turnstile loaded")}
              onExpire={() => {
                setCaptchaToken(null);
                setCaptchaKey((prev) => prev + 1);
              }}
              onError={() => {
                setCaptchaToken(null);
                setCaptchaKey((prev) => prev + 1);
              }}
              theme="light"
            />
          </div>
        )}

        {emptyError && (
          <ValidateError>
            {show2FA
              ? "Please enter the 6-digit code."
              : "Please fill in all required fields."}
          </ValidateError>
        )}

        <Button
          type="submit"
          disabled={
            (show2FA && twoFactorCode.length !== 6) ||
            (!show2FA && !captchaToken)
          }
          className="rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {show2FA ? "Verify Code" : "Log in"}
        </Button>
      </form>

      {!show2FA && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/registrationMain"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      )}

      <Link
        to="/"
        className="mt-8 inline-block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back home
      </Link>
    </AuthSplitLayout>
  );
}
