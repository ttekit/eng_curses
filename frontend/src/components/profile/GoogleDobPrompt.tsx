import { useState, forwardRef } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import Button from "../../components/Button";
import ValidateError from "../../components/ValidateError";
import LabelRegister from "../../components/LabelRegister";
import {
  saveUserDateOfBirth,
  validateDateOfBirthInput,
} from "../../lib/saveUserDateOfBirth";
import { AuthPageSeo } from "../../lib/authPageSeo";
import { useUser } from "../../context/UserContext";
import type { GoogleDobDateInputProps } from "../../types/date-picker-input";

const CustomDateInput = forwardRef<HTMLInputElement, GoogleDobDateInputProps>(
  (props, ref) => {
  const { onClick, dobValue, onDobChange } = props;

  return (
    <div className="relative w-full">
      <input
        type="date"
        ref={ref}
        value={dobValue || ""}
        onChange={(e) => onDobChange(e.target.value)}
        min="1900-01-01"
        max={new Date().toISOString().split("T")[0]}
        className="w-full rounded-xl border border-input bg-background pl-4 pr-12 py-3 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 cursor-pointer"
      />
      <button
        type="button"
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
      >
        <CalendarIcon className="size-5" />
      </button>
    </div>
  );
  },
);
CustomDateInput.displayName = "CustomDateInput";

export default function GoogleDobPrompt() {
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateOfBirth) {
      setErrorText("Date of birth is required");
      return;
    }

    const validationError = validateDateOfBirthInput(dateOfBirth);
    if (validationError) {
      setErrorText(validationError);
      return;
    }

    setErrorText(null);
    setLoading(true);

    try {
      await saveUserDateOfBirth(dateOfBirth);
      toast.success("Date of birth saved!");
      await refreshProfile();
      navigate("/catalog", { replace: true });
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "Failed to save date of birth.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthPageSeo
        title="Date of Birth | Explys"
        description="Enter your date of birth"
        path="/onboarding/dob"
      />
      <AuthSplitLayout
        progressStep={1}
        progressTotal={3}
        rightTitle="Just one more step"
        rightSubtitle="We need your date of birth to personalize your experience."
      >
        <div className="mb-1 flex items-center gap-3">
          <img src="/Icon.svg" className="w-15 h-18 mr-4" alt="Icon" />
          <h1 className="font-display text-2xl font-bold">
            When is your birthday?
          </h1>
        </div>
        <p className="mb-8 text-muted-foreground">
          Please enter your date of birth to continue setting up your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                  } else {
                    setDateOfBirth("");
                  }
                }}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={new Date("1900-01-01")}
                maxDate={new Date()}
                wrapperClassName="w-full"
                customInput={
                  <CustomDateInput
                    dobValue={dateOfBirth}
                    onDobChange={setDateOfBirth}
                  />
                }
              />
            </div>
          </div>

          {errorText && <ValidateError>{errorText}</ValidateError>}

          <Button
            type="submit"
            disabled={loading || !dateOfBirth}
            className="w-full rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-6"
          >
            {loading ? "Saving..." : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </AuthSplitLayout>
    </>
  );
}
