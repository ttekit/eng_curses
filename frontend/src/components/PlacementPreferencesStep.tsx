import { FormEvent, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import Button from "./Button";
import InputText from "./InputText";
import LabelRegister from "./LabelRegister";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { useUser, type UserData } from "../context/UserContext";
import { useLandingLocale } from "../context/LandingLocaleContext";

export default function PlacementPreferencesStep({
  user,
  onSuccess,
}: {
  user: UserData;
  onSuccess: (updatedProfile: UserData | null) => void;
}) {
  const { refreshProfile, user: contextUser } = useUser();
  const { messages } = useLandingLocale();
  const s = messages.placementFlow.student;
  const a = messages.placementFlow.adult;
  const collectIndependentProfile = user.role === "student";

  const [workField, setWorkField] = useState(
    () => user.workField?.trim() ?? "",
  );
  const [education, setEducation] = useState(
    () => user.education?.trim() ?? "",
  );
  const [nativeLanguage, setNativeLanguage] = useState(
    () => user.nativeLanguage?.trim() ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (collectIndependentProfile) {
      const j = workField.trim();
      const ed = education.trim();
      const nl = nativeLanguage.trim();
      if (!j) {
        setFieldError(a.errorJob);
        return;
      }
      if (!ed) {
        setFieldError(a.errorEducation);
        return;
      }
      if (!nl) {
        setFieldError(a.errorNativeLanguage);
        return;
      }
    }

    setSaving(true);
    try {
      const userId = contextUser?.id || user?.id;

      if (!userId) {
        toast.error(s.errorMissingUserId);
        return;
      }

      const profilePatch = collectIndependentProfile
        ? {
            workField: workField.trim(),
            education: education.trim(),
            nativeLanguage: nativeLanguage.trim(),
          }
        : {};

      const hobbiesPayload =
        user.hobbies && user.hobbies.length > 0 ? user.hobbies : ["English"];

      const res = await apiFetch(`/users/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          ...profilePatch,
          hobbies: hobbiesPayload,
          favoriteGenres: user.favoriteGenres ?? [],
          hatedGenres: user.hatedGenres ?? [],
        }),
      });

      if (!res.ok) {
        const errorMsg = await readApiErrorBody(res);
        setFieldError(errorMsg || s.saveErrorToast);
        toast.error(errorMsg || s.saveErrorToast);
        return;
      }

      const nextProfile = await refreshProfile();
      onSuccess(nextProfile);
    } catch {
      toast.error(s.saveErrorToast);
      setFieldError(s.saveErrorToast);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pt-2 [&_label]:text-foreground"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {s.title}
        </h2>
        {collectIndependentProfile && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {a.formIntro}
          </p>
        )}
      </div>

      {collectIndependentProfile ? (
        <section className="space-y-4 rounded-xl border border-border/50 bg-muted/15 p-4">
          <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
            {a.sectionAbout}
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <LabelRegister isRequired={true}>{a.job}</LabelRegister>
              <InputText
                name="workField"
                value={workField}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setWorkField(e.target.value)
                }
                placeholder={a.jobPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <LabelRegister isRequired={true}>{a.education}</LabelRegister>
              <InputText
                name="education"
                value={education}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEducation(e.target.value)
                }
                placeholder={a.educationPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <LabelRegister isRequired={true}>
                {a.nativeLanguage}
              </LabelRegister>
              <InputText
                name="nativeLanguage"
                value={nativeLanguage}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNativeLanguage(e.target.value)
                }
                placeholder={a.nativeLanguagePlaceholder}
              />
            </div>
          </div>
        </section>
      ) : null}

      {fieldError ? (
        <p
          className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg"
          role="alert"
        >
          {fieldError}
        </p>
      ) : null}

      <Button type="submit" disabled={saving} className="!mt-2">
        {saving ? s.saving : s.continueCta}
      </Button>
    </form>
  );
}
