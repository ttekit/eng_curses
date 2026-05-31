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
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useLandingLocale } from "../../context/LandingLocaleContext";
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
  if (!profile) return "/subscribe";

  if (profile.role === "admin") return "/admin";
  if (profile.role === "teacher") return "/catalog";

  // 1. Если роль не выбрана
  if (
    !profile.role ||
    profile.role === "choose" ||
    profile.role === "regular"
  ) {
    return "/registrationDetails";
  }

  // 2. Жанры
  if (
    (!profile.favoriteGenres || profile.favoriteGenres.length === 0) &&
    (!profile.hatedGenres || profile.hatedGenres.length === 0)
  ) {
    return "/registrationPreferences";
  }

  // 3. БИОГРАФИЯ (жесткая проверка для студентов)
  // Если это студент, проверяем наличие данных, которые собираются в PlacementPreTestStep
  if (
    profile.role === "student" &&
    (!profile.education ||
      profile.education.trim() === "" ||
      !profile.workField ||
      profile.workField.trim() === "" ||
      !profile.nativeLanguage ||
      profile.nativeLanguage.trim() === "")
  ) {
    // ВАЖНО: возвращаем путь, где эта биография собирается (у тебя это, видимо, регистрация)
    return "/registrationDetails";
  }

  // 4. Уровень английского
  if (
    !profile.englishLevel ||
    profile.englishLevel === "choose" ||
    profile.englishLevel === ""
  ) {
    return "/registrationDetails";
  }

  // 5. Тест (должен идти последним!)
  if (!profile.hasCompletedPlacement) {
    return "/level-test";
  }

  if (explicit) return explicit;
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
  const { messages } = useLandingLocale();
  const loginSeo = messages.auth.login;

  useEffect(() => {
    const s = location.state as {
      registrationComplete?: boolean;
      from?: string;
    } | null;
    if (!s?.registrationComplete) {
      return;
    }
    if (consumePendingRegistrationLoginWelcome()) {
      toast.success(loginSeo.toastAccountCreated);
    }
    navigate("/loginForm", {
      replace: true,
      state: s.from ? { from: s.from } : undefined,
    });
  }, [location.state, navigate, loginSeo.toastAccountCreated]);

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
      toast.error(loginSeo.captchaWait);
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
            toast.success(loginSeo.verificationCodeSent);

            setCaptchaToken(null);
            setCaptchaKey((prev) => prev + 1);
            return;
          }

          const token = data.access_token;
          const fromState = safeReturnPath(location.state);

          if (!token) {
            const next = postLoginNavigateTarget(fromState, null);
            toast.success(loginSeo.toastSignedIn);
            navigate(next);
          } else {
            setStoredAccessToken(token);
            const profile = await refreshProfile();
            const next = postLoginNavigateTarget(fromState, profile);
            toast.success(loginSeo.toastSignedIn);
            navigate(next);
          }
        } else {
          const errorData = await response.json();

          if (!show2FA) {
            setCaptchaToken(null);
            setCaptchaKey((prev) => prev + 1);
          }

          if (errorData?.error === "EMAIL_NOT_VERIFIED") {
            toast.error(loginSeo.emailNotVerified);
            navigate("/verify-email", {
              state: { email: loginData.email, isLoginFlow: true },
            });
          } else {
            toast.error(errorData?.message || loginSeo.toastSignInError);
          }
        }
      } catch (error) {
        if (!show2FA) {
          setCaptchaToken(null);
          setCaptchaKey((prev) => prev + 1);
        }

        toast.error(loginSeo.networkError);
      }
    } else {
      setEmptyError(true);
    }
  };

  return (
    <>
      <AuthPageSeo
        title={loginSeo.seoTitle}
        description={loginSeo.seoDescription}
        path="/loginForm"
      />
      <AuthSplitLayout
        rightTitle={loginSeo.rightTitle}
        rightSubtitle={loginSeo.rightSubtitle}
      >
        <div className="mb-2 flex items-center gap-3">
          <img src="/Icon.svg" className="w-12 h-15" alt="Logo" />
          <h1 className="font-display text-2xl font-bold">
            {loginSeo.welcomeBack}
          </h1>
        </div>
        <p className="mb-8 text-muted-foreground">{loginSeo.lead}</p>

        <form onSubmit={handleLogin} tabIndex={0} className="space-y-5">
          {!show2FA ? (
            <>
              <div className="space-y-2">
                <LabelRegister isRequired={true}>{loginSeo.email}</LabelRegister>
                <InputText
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder={loginSeo.placeholderEmail}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <LabelRegister isRequired={true}>
                    {loginSeo.password}
                  </LabelRegister>
                  <Link
                    to="#"
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    {loginSeo.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <InputText
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder={loginSeo.placeholderPassword}
                    autoComplete="current-password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? loginSeo.hidePassword
                        : loginSeo.showPassword
                    }
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
                  {loginSeo.twoFactorLeadPrefix} <br />
                  <span className="font-medium text-primary">
                    {maskEmail(loginData.email)}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <LabelRegister isRequired={true}>
                  {loginSeo.twoFactorTitle}
                </LabelRegister>
                <InputText
                  name="twoFactorCode"
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  type="text"
                  placeholder={loginSeo.twoFactorPlaceholder}
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
                  {loginSeo.backToLogin}
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
                ? loginSeo.codeRequired
                : loginSeo.fillRequired}
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
            {show2FA ? loginSeo.verifyCode : loginSeo.submit}
          </Button>
        </form>

        {!show2FA && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {loginSeo.noAccount}{" "}
            <Link
              to="/registrationMain"
              className="font-medium text-primary hover:underline"
            >
              {loginSeo.signUp}
            </Link>
          </p>
        )}

        <Link
          to="/"
          className="mt-8 inline-block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {loginSeo.backHome}
        </Link>
      </AuthSplitLayout>
    </>
  );
}
