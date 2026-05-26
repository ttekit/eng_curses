import InputText from "../../components/InputText";
import Button from "../../components/Button";
import ValidateError from "../../components/ValidateError";
import LabelRegister from "../../components/LabelRegister";
import { Link, useNavigate } from "react-router";
import { useContext, useState, ChangeEvent, FormEvent } from "react";
import { RegistrationContext } from "../../context/RegistrationContext";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import Turnstile from "react-turnstile";
import { registerUser } from "../../lib/registerUser";

export default function RegistrationMain() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error("RegistrationContext is not available");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState<number>(0);

  const { formData, updateFormData } = context;
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const isValidPassword = (p: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(p);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((prev) => prev + 1);
  };

  const validateField = (
    value: string,
    type: "password" | "email" | "confirmPassword" | "other",
    passwordToCompare?: string,
  ) => {
    if (type === "password") {
      if (value.length < 8) {
        setErrorText("Password must be at least 8 characters.");
        return false;
      }
      if (!/[A-Z]/.test(value)) {
        setErrorText("Password must contain at least one uppercase letter.");
        return false;
      }
      if (!/[a-z]/.test(value)) {
        setErrorText("Password must contain at least one lowercase letter.");
        return false;
      }
      if (!/\d/.test(value)) {
        setErrorText("Password must contain at least one number.");
        return false;
      }
      if (!/[@$!%*?&]/.test(value)) {
        setErrorText("Password must contain at least one of: @ $ ! % * ? &");
        return false;
      }
    }

    if (type === "confirmPassword") {
      const pw = passwordToCompare ?? formData.password;
      if (value !== pw) {
        setErrorText("Passwords do not match.");
        return false;
      }
    }

    if (type === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        setErrorText("Invalid email format.");
        return false;
      }
    }

    if (type === "other") {
      if (value.trim() === "") {
        setErrorText("Please fill in all required fields.");
        return false;
      }
    }

    setErrorText(null);
    return true;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "password" | "email" | "confirmPassword" | "other",
  ) => {
    const { value } = e.target;
    const name = e.target.name as keyof typeof formData & string;
    updateFormData({ [name]: value } as Record<string, string>);

    const passFromForm =
      e.currentTarget.form?.querySelector<HTMLInputElement>(
        'input[name="password"]',
      )?.value ?? formData.password;
    if (type === "confirmPassword") {
      validateField(value, "confirmPassword", passFromForm);
    } else {
      validateField(value, type);
    }
  };

  const handleNext = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    if (!name) {
      setErrorText("Username is required.");
      resetCaptcha();
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorText("Invalid email format.");
      resetCaptcha();
      return;
    }
    if (!password || !isValidPassword(password)) {
      setErrorText("Password does not meet requirements.");
      resetCaptcha();
      return;
    }
    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      resetCaptcha();
      return;
    }
    if (!captchaToken) {
      setErrorText("Please wait for the captcha verification to complete.");
      return;
    }

    setErrorText(null);

    try {
      localStorage.setItem("temp_email", email);

      const result = (await registerUser({
        name,
        email,
        password,
        confirmPassword,
        token: captchaToken,
        captchaToken: captchaToken,
        role: formData.role,
      } as any)) as any;

      if (result.success) {
        if (result.isVerified) {
          navigate("/registrationDetails");
        } else {
          navigate("/verify-email", {
            state: { email },
          });
        }
      } else {
        setErrorText(result.message || "Registration failed.");
        resetCaptcha();
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorText("Network error.");
      resetCaptcha();
    }
  };

  const handleBack = () => {
    updateFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      englishLevel: "choose",
      hobbies: [],
      education: "",
      workField: "",
      favoriteGenres: [],
      hatedGenres: [],
      learningGoal: "",
      timeToAchieve: "",
    });
  };

  return (
    <>
      <SEO
        title="Create account"
        description="Register for Explys to start learning English with personalized video lessons."
        canonicalUrl={resolveCanonicalUrl("/registrationMain")}
        noindex
      />
      <AuthSplitLayout
        progressStep={1}
        progressTotal={3}
        rightTitle="Welcome to Explys!"
        rightSubtitle="Join thousands of learners improving their English through personalized video content."
      >
        <div className="mb-1 flex items-center gap-3">
          <img src="/Icon.svg" className="w-15 h-18 mr-4" />
          <h1 className="font-display text-2xl font-bold">Join Explys</h1>
        </div>
        <p className="mb-8 text-muted-foreground">
          Create your account and start your personalized learning journey
        </p>

        <form onSubmit={handleNext} tabIndex={0} className="space-y-5">
          <div className="space-y-2">
            <LabelRegister isRequired={true}>Username</LabelRegister>
            <InputText
              name="name"
              value={formData.name}
              onChange={(e) => handleChange(e, "other")}
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <LabelRegister isRequired={true}>Email</LabelRegister>
            <InputText
              name="email"
              value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LabelRegister isRequired={true}>Password</LabelRegister>
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="hover:cursor-pointer size-5 opacity-70" />
                ) : (
                  <Eye className="hover:cursor-pointer size-5 opacity-70" />
                )}
              </button>
            </div>
            <InputText
              name="password"
              value={formData.password}
              onChange={(e) => handleChange(e, "password")}
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LabelRegister isRequired={true}>Confirm password</LabelRegister>
              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5 opacity-70" />
                ) : (
                  <Eye className="size-5 opacity-70" />
                )}
              </button>
            </div>
            <InputText
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleChange(e, "confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>

          {errorText && <ValidateError>{errorText}</ValidateError>}

          <div
            className="flex justify-center py-2"
            style={{ minHeight: "65px" }}
          >
            <Turnstile
              key={captchaKey}
              sitekey="0x4AAAAAADSk3etSiWLwGH5-"
              onVerify={(token) => setCaptchaToken(token)}
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

          <Button
            type="submit"
            disabled={!captchaToken}
            className="rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="size-4" />
            Back home
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/loginForm"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </AuthSplitLayout>
    </>
  );
}
