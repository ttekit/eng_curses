/* eslint-disable react-refresh/only-export-components -- shared context/helpers */
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Button from "./Button";
import LabelRegister from "./LabelRegister";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { useUser, type UserData } from "../context/UserContext";
import { useAppMessages } from "../hooks/useAppMessages";
import { cn } from "../lib/utils";
import {
  ADULT_PLACEMENT_CEFR_LEVELS,
  ADULT_PLACEMENT_CEFR_SET,
  ADULT_SKIP_PLACEMENT_TEST,
  adult_needs_placement_cefr,
  parse_adult_profile_cefr_target,
} from "../lib/placement_cefr";

type PlacementPreTestSuccessDetail = {
  readonly skippedPlacementTest: boolean;
};

const selectFieldClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

export function adultNeedsPlacementPrepFields(user: UserData): boolean {
  return adult_needs_placement_cefr(user);
}

export function studentNeedsPlacementPreferencesOverlay(
  _user: UserData,
): boolean {
  return false;
}

export default function PlacementPreTestStep({
  user,
  onSuccess,
}: {
  user: UserData;
  onSuccess: (detail?: PlacementPreTestSuccessDetail) => void;
}) {
  const { refreshProfile } = useUser();
  const a = useAppMessages().placementFlow.adult;

  const [englishLevelChoice, setEnglishLevelChoice] = useState(() => {
    const fromProfile = parse_adult_profile_cefr_target(user.englishLevel);
    return fromProfile === "" ? "" : fromProfile;
  });
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    const hasCefrTarget = ADULT_PLACEMENT_CEFR_SET.has(englishLevelChoice);
    const isSkip = englishLevelChoice === ADULT_SKIP_PLACEMENT_TEST;
    if (englishLevelChoice === "" || (!hasCefrTarget && !isSkip)) {
      setFieldError(a.errorEnglishLevel);
      return;
    }

    setSaving(true);
    try {
      const skipTest = isSkip;
      const res = await apiFetch(`/users/profile`, {
        method: "PATCH",
        body: JSON.stringify(
          skipTest
            ? { englishLevel: "A1", hasCompletedPlacement: true }
            : { englishLevel: englishLevelChoice },
        ),
      });
      if (!res.ok) {
        toast.error(await readApiErrorBody(res));
        return;
      }
      await refreshProfile();
      onSuccess(skipTest ? { skippedPlacementTest: true } : undefined);
    } catch (error) {
      console.error("Failed to save placement CEFR level:", error);
      toast.error(a.saveErrorToast);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pt-2 [&_label]:text-foreground"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <p className="text-xs leading-relaxed text-muted-foreground">
        {a.englishLevelHelp}
      </p>

      <section className="space-y-3 rounded-xl border border-border/50 bg-muted/15 p-4">
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
          {a.sectionEnglish}
        </h3>
        <div className="space-y-2">
          <LabelRegister isRequired={true}>{a.englishLevel}</LabelRegister>
          <select
            name="englishLevel"
            value={englishLevelChoice}
            onChange={(e) => setEnglishLevelChoice(e.target.value)}
            className={cn(selectFieldClass, "appearance-auto")}
            aria-describedby="placement-english-level-help"
          >
            <option value="" disabled>
              {a.englishLevelSelectPlaceholder}
            </option>
            <option value={ADULT_SKIP_PLACEMENT_TEST}>
              {a.englishLevelNone}
            </option>
            {ADULT_PLACEMENT_CEFR_LEVELS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <p
            id="placement-english-level-help"
            className="text-muted-foreground text-sm"
          >
            {a.englishLevelHelp}
          </p>
        </div>
      </section>

      {fieldError ? (
        <p className="text-destructive text-sm" role="alert">
          {fieldError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {saving
          ? a.saving
          : englishLevelChoice === ADULT_SKIP_PLACEMENT_TEST
            ? a.continueWithoutTestCta
            : a.continueCta}
      </Button>
    </form>
  );
}
