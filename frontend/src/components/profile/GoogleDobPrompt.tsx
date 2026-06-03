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
import { apiFetch } from "../../lib/api";
import { AuthPageSeo } from "../../lib/authPageSeo";

const CustomDateInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { onClick, value, onChange } = props;
  return (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        ref={ref}
        value={value || ""}
        onClick={onClick}
        onChange={onChange}
        placeholder="YYYY-MM-DD"
        className="w-full bg-[#161622] border border-[#2a2b36] rounded-xl pl-4 pr-12 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
      />
      <button
        type="button"
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
      >
        <CalendarIcon className="size-5" />
      </button>
    </div>
  );
});
CustomDateInput.displayName = "CustomDateInput";

export default function GoogleDobPrompt() {
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateOfBirth) {
      setErrorText("Date of birth is required");
      return;
    }

    const age = Math.abs(
      new Date(Date.now() - dateOfBirth.getTime()).getUTCFullYear() - 1970,
    );
    if (age < 13) {
      setErrorText("You must be at least 13 years old.");
      return;
    }

    setErrorText(null);
    setLoading(true);

    try {
      const response = await apiFetch("/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateOfBirth: `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, "0")}-${String(dateOfBirth.getDate()).padStart(2, "0")}`,
        }),
      });

      if (response.ok) {
        toast.success("Date of birth saved!");
        navigate("/registrationDetails");
      } else {
        const errorData = await response.json();
        setErrorText(errorData?.message || "Failed to save date of birth.");
      }
    } catch (error) {
      setErrorText("Network error. Please try again.");
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
                selected={dateOfBirth}
                onChange={(date: Date | null) => setDateOfBirth(date)}
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

          {errorText && <ValidateError>{errorText}</ValidateError>}

          <Button
            type="submit"
            disabled={loading || !dateOfBirth}
            className="rounded-[15px] bg-primary px-6 py-4 mt-6 text-sm font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)] w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </AuthSplitLayout>
    </>
  );
}
