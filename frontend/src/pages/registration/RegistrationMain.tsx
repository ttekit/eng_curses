import InputText from "../../components/InputText";
import Button from "../../components/Button";
import ValidateError from "../../components/ValidateError";
import LabelRegister from "../../components/LabelRegister";
import { Link, useNavigate } from "react-router";
import {
  useContext,
  useState,
  ChangeEvent,
  FormEvent,
  forwardRef,
} from "react";
import { RegistrationContext } from "../../context/RegistrationContext";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import Turnstile from "react-turnstile";
import { registerUser } from "../../lib/registerUser";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDateInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { onClick } = props;
  const context = useContext(RegistrationContext);

  return (
    <div className="relative w-full">
      <input
        type="date"
        ref={ref}
        name="dateOfBirth"
        value={context?.formData.dateOfBirth || ""}
        onChange={(e) => {
          context?.updateFormData({ dateOfBirth: e.target.value } as Record<
            string,
            string
          >);
        }}
        max={new Date().toISOString().split("T")[0]}
        className="w-full bg-[#161622] border border-[#2a2b36] rounded-xl pl-4 pr-12 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
      />
      <button
        type="button"
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors flex items-center justify-center"
      >
        <CalendarIcon className="size-5" />
      </button>
    </div>
  );
});
CustomDateInput.displayName = "CustomDateInput";

export default function RegistrationMain() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error("RegistrationContext is not available");

  const { messages } = useLandingLocale();
  const step1 = messages.auth.registration.step1;
  const errors = messages.auth.registration.errors;

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
        setErrorText(errors.passwordMin8);
        return false;
      }
      if (!/[A-Z]/.test(value)) {
        setErrorText(errors.passwordUpper);
        return false;
      }
      if (!/[a-z]/.test(value)) {
        setErrorText(errors.passwordLower);
        return false;
      }
      if (!/\d/.test(value)) {
        setErrorText(errors.passwordNumber);
        return false;
      }
      if (!/[@$!%*?&]/.test(value)) {
        setErrorText(errors.passwordSpecial);
        return false;
      }
    }

    if (type === "confirmPassword") {
      const pw = passwordToCompare ?? formData.password;
      if (value !== pw) {
        setErrorText(errors.passwordsNoMatch);
        return false;
      }
    }

    if (type === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        setErrorText(errors.emailInvalid);
        return false;
      }
    }

    if (type === "other") {
      if (value.trim() === "") {
        setErrorText(errors.fillRequired);
        return false;
      }
    }

    setErrorText(null);
    return true;
  };

  const validateDateOfBirth = (value: string) => {
    if (!value) {
      setErrorText(errors.dateOfBirthRequired);
      return false;
    }

    const birthDate = new Date(value);
    const today = new Date();

    if (isNaN(birthDate.getTime()) || birthDate > today) {
      setErrorText(errors.dateOfBirthInvalid);
      return false;
    }

    const ageDiffMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 13) {
      setErrorText(errors.ageMinimum);
      return false;
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
    const dateOfBirth = formData.dateOfBirth || "";

    if (!name) {
      setErrorText(errors.usernameRequired);
      resetCaptcha();
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorText(errors.emailInvalid);
      resetCaptcha();
      return;
    }
    if (!password || !isValidPassword(password)) {
      setErrorText(errors.passwordWeak);
      resetCaptcha();
      return;
    }
    if (password !== confirmPassword) {
      setErrorText(errors.passwordsNoMatch);
      resetCaptcha();
      return;
    }
    if (!captchaToken) {
      setErrorText(errors.captchaWait);
      return;
    }
    if (!validateDateOfBirth(dateOfBirth)) {
      resetCaptcha();
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
        dateOfBirth,
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
        setErrorText(result.message || errors.registrationFailed);
        resetCaptcha();
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorText(errors.networkError);
      resetCaptcha();
    }
  };

  const handleBack = () => {
    updateFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
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
      <AuthPageSeo
        title={step1.seoTitle}
        description={step1.seoDescription}
        path="/registrationMain"
      />
      <AuthSplitLayout
        progressStep={1}
        progressTotal={3}
        rightTitle={step1.rightTitle}
        rightSubtitle={step1.rightSubtitle}
      >
        <div className="mb-1 flex items-center gap-3">
          <img src="/Icon.svg" className="w-15 h-18 mr-4" alt="Icon" />
          <h1 className="font-display text-2xl font-bold">{step1.title}</h1>
        </div>
        <p className="mb-8 text-muted-foreground">{step1.lead}</p>

        <form onSubmit={handleNext} tabIndex={0} className="space-y-5">
          <div className="space-y-2">
            <LabelRegister isRequired={true}>{step1.username}</LabelRegister>
            <InputText
              name="name"
              value={formData.name}
              onChange={(e) => handleChange(e, "other")}
              type="text"
              placeholder={step1.placeholderUsername}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <LabelRegister isRequired={true}>{step1.email}</LabelRegister>
            <InputText
              name="email"
              value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              type="email"
              placeholder={step1.placeholderEmail}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <LabelRegister isRequired={true}>{step1.dateOfBirth}</LabelRegister>
            <div className="relative">
              <DatePicker
                selected={
                  formData.dateOfBirth && !isNaN(new Date(formData.dateOfBirth).getTime())
                    ? new Date(formData.dateOfBirth)
                    : null
                }
                onChange={(date: Date | null) => {
                  if (date && !isNaN(date.getTime())) {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    const formatted = `${y}-${m}-${d}`;
                    updateFormData({ dateOfBirth: formatted } as Record<string, string>);
                  }
                }}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                wrapperClassName="w-full"
                customInput={<CustomDateInput />}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LabelRegister isRequired={true}>{step1.password}</LabelRegister>
              <button
                type="button"
                aria-label={
                  showPassword ? step1.hidePassword : step1.showPassword
                }
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
              placeholder={step1.placeholderPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <LabelRegister isRequired={true}>
                {step1.confirmPassword}
              </LabelRegister>
              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? step1.hideConfirmPassword
                    : step1.showConfirmPassword
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
              placeholder={step1.placeholderConfirm}
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
            {step1.continue}
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
            {step1.backHome}
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {step1.haveAccount}{" "}
          <Link
            to="/loginForm"
            className="font-medium text-primary hover:underline"
          >
            {step1.logIn}
          </Link>
        </p>
      </AuthSplitLayout>
    </>
  );
}
