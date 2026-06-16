import { useState } from "react";
import { X } from "lucide-react";
import Button from "../Button";
import ValidateError from "../ValidateError";
import LabelRegister from "../LabelRegister";
import {
  saveUserDateOfBirth,
  validateDateOfBirthInput,
} from "../../lib/saveUserDateOfBirth";
import { useUser } from "../../context/UserContext";
import { useLandingLocale } from "../../context/LandingLocaleContext";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ageRestriction?: string;
  onSaved?: () => void;
}

export function AgeVerificationModal({
  isOpen,
  onClose,
  ageRestriction,
  onSaved,
}: AgeVerificationModalProps) {
  const { refreshProfile } = useUser();
  const { messages } = useLandingLocale();
  const copy = messages.catalogPage.ageVerification;
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateDateOfBirthInput(dateOfBirth);
    if (validationError) {
      setErrorText(validationError);
      return;
    }
    setErrorText(null);
    setLoading(true);
    try {
      await saveUserDateOfBirth(dateOfBirth);
      await refreshProfile();
      onSaved?.();
      onClose();
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : copy.saveFailed,
      );
    } finally {
      setLoading(false);
    }
  };

  const restrictionLabel = ageRestriction?.trim() || "18+";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">{copy.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy.lead.replace("{age}", restrictionLabel)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:cursor-pointer"
            aria-label={copy.closeAria}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <LabelRegister isRequired={true}>{copy.dateLabel}</LabelRegister>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {errorText && <ValidateError>{errorText}</ValidateError>}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer"
            >
              {copy.cancel}
            </Button>
            <Button
              type="submit"
              disabled={loading || !dateOfBirth}
              className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? copy.saving : copy.continue}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
