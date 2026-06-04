import { useState, forwardRef } from "react";
import { useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { apiFetch } from "./api";
import { AuthSplitLayout } from "../components/AuthSplitLayout";
import LabelRegister from "../components/LabelRegister";
import ValidateError from "../components/ValidateError";
import Button from "../components/Button";

const CustomDateInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { onClick, value, onChange } = props;
  return (
    <div className="relative w-full">
      <input
        type="date"
        ref={ref}
        value={value}
        onChange={onChange}
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

export default function OnboardingDob() {
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateDateOfBirth = (value: string) => {
    if (!value) {
      setErrorText("Date of birth is required");
      return false;
    }

    const birthDate = new Date(value);
    const today = new Date();

    if (isNaN(birthDate.getTime()) || birthDate > today) {
      setErrorText("Invalid date of birth");
      return false;
    }

    const ageDiffMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 13) {
      setErrorText("You must be at least 13 years old to register.");
      return false;
    }

    setErrorText(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDateOfBirth(dateOfBirth)) return;

    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem("exply_access_token");

      const response = await apiFetch("/auth/update-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ dateOfBirth }),
      });

      if (response.ok) {
        navigate("/registrationDetails", { replace: true });
      } else {
        const errorData = await response.json();
        setErrorText(errorData.message || "Failed to save date of birth.");
      }
    } catch (error) {
      setErrorText("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      progressStep={1}
      progressTotal={2}
      rightTitle="Just one more detail"
      rightSubtitle="Tell us a bit about yourself"
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">
          When is your birthday?
        </h1>
        <p className="mt-2 text-muted-foreground">
          We need this to personalize your learning experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <LabelRegister isRequired={true}>Date of Birth</LabelRegister>
          <div className="relative">
            <DatePicker
              selected={
                dateOfBirth && !isNaN(new Date(dateOfBirth).getTime())
                  ? new Date(dateOfBirth)
                  : null
              }
              onChange={(date: Date | null) => {
                if (date && !isNaN(date.getTime())) {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  setDateOfBirth(`${y}-${m}-${d}`);
                  validateDateOfBirth(`${y}-${m}-${d}`);
                }
              }}
              dateFormat="yyyy-MM-dd"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              wrapperClassName="w-full"
              customInput={
                <CustomDateInput
                  value={dateOfBirth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setDateOfBirth(e.target.value);
                    validateDateOfBirth(e.target.value);
                  }}
                />
              }
            />
          </div>
        </div>

        {errorText && <ValidateError>{errorText}</ValidateError>}

        <Button
          type="submit"
          disabled={!dateOfBirth || isSubmitting}
          className="w-full rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Continue"}
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
