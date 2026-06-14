import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Plus, Save, Shield, User, X } from "lucide-react";
import {
  apiFetch,
  getResponseErrorMessage,
  setStoredAccessToken,
} from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router";
import InputText from "../InputText";
import { ProfileCard } from "./ProfileCard";
import { ToggleSwitch } from "./ToggleSwitch";
import { Lock } from "lucide-react";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import { maskEmail } from "../../lib/formatters";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { forwardRef } from "react";
import { Monitor } from "lucide-react";
import { useLandingLocale } from "../../context/LandingLocaleContext";

type GenreOption = { id: number; name: string };

const CustomDateInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { onClick, value, onChange, onKeyDown, id, isError } = props;
  return (
    <div className="relative w-full">
      <input
        id={id}
        type="date"
        ref={ref}
        value={value || ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
        autoComplete="off"
        className={`flex h-12 w-full bg-background border ${
          isError
            ? "border-destructive focus:ring-destructive/40 hover:border-destructive/80"
            : "border-input hover:border-primary/50 focus:ring-primary/40"
        } rounded-xl pl-4 pr-12 py-2 text-[15px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-background transition-all cursor-pointer shadow-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0`}
      />

      <button
        type="button"
        onClick={onClick}
        tabIndex={-1}
        className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors ${
          isError
            ? "text-destructive"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        <CalendarIcon className="size-5" />
      </button>
    </div>
  );
});
CustomDateInput.displayName = "CustomDateInput";

export function ProfileSettings({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user, refreshProfile, logout } = useUser();
  const { locale, setLocale } = useLandingLocale();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Проверяем текущую тему при загрузке
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  // Функция для применения темы
  const applyTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const navigate = useNavigate();
  const s = useAppMessages().profileSettings;

  const isTeacherStudent =
    user?.role?.toLowerCase() === "student" &&
    Boolean((user as any).teacherId || (user as any).teacherName);

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    if (!user?.dateOfBirth) return "";
    return new Date(user.dateOfBirth).toISOString().split("T")[0];
  });
  const [job, setJob] = useState(user?.workField || "");
  const [education, setEducation] = useState(user?.education || "");

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [emailChangeStep, setEmailChangeStep] = useState<1 | 2>(1);
  const [emailChangeCode, setEmailChangeCode] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [dangerCode, setDangerCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [dangerError, setDangerError] = useState("");

  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [hobbies, setHobbies] = useState<string[]>(user?.hobbies ?? []);
  const [favoriteGenreIds, setFavoriteGenreIds] = useState<number[]>(
    user?.favoriteGenres ?? [],
  );
  const [hatedGenreIds, setHatedGenreIds] = useState<number[]>(
    user?.hatedGenres ?? [],
  );
  const [newHobby, setNewHobby] = useState("");
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [dangerOpen, setDangerOpen] = useState<"reset" | "delete" | null>(null);

  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [target2FAState, setTarget2FAState] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");

  const [, setIsChangeEmailModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setJob(user.workField || "");
      setEducation(user.education || "");
      setHobbies(user.hobbies ?? []);
      setFavoriteGenreIds(user.favoriteGenres ?? []);
      setHatedGenreIds(user.hatedGenres ?? []);
    }
  }, [user]);

  if (!user) return null;

  const handleToggle2FAClick = (checked: boolean) => {
    setTarget2FAState(checked);
    setTwoFactorPassword("");
    setError("");
    setIsToggling2FA(true);
  };

  const handleConfirm2FAToggle = async () => {
    if (!twoFactorPassword) {
      setError("Please enter your current password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiFetch("/auth/toggle-2fa", {
        method: "POST",
        body: JSON.stringify({
          enable: target2FAState,
          password: twoFactorPassword,
        }),
      });

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        await refreshProfile();

        setIsToggling2FA(false);
        setTwoFactorPassword("");

        toast.success(
          target2FAState
            ? "Two-factor authentication enabled"
            : "Two-factor authentication disabled",
        );
      } else {
        const data = await response.json();
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    setError("");

    if (emailChangeStep === 1) {
      if (emailChangeCode.length !== 6) {
        return setError("Please enter the 6-digit code.");
      }

      setIsLoading(true);
      try {
        const response = await apiFetch("/auth/check-email-change-code", {
          method: "POST",
          body: JSON.stringify({ code: emailChangeCode }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Invalid code");
        }

        setEmailChangeStep(2);
        setError("");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!newEmail || !confirmNewEmail)
      return setError("Please fill in all email fields.");
    if (newEmail !== confirmNewEmail) return setError("Emails do not match.");

    setIsLoading(true);
    try {
      const response = await apiFetch("/auth/verify-email-change", {
        method: "POST",
        body: JSON.stringify({
          code: emailChangeCode,
          newEmail: newEmail,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Failed to update email");

      toast.success("Email successfully updated!");
      await refreshProfile();
      setIsChangingEmail(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEmailChange = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiFetch("/auth/send-email-change-code", {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send verification code");
      }

      setEmailChangeStep(1);
      setEmailChangeCode("");
      setNewEmail("");
      setConfirmNewEmail("");
      setIsChangingEmail(true);

      toast.success("Verification code sent to your current email!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Invalid current password or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDangerZone = async (action: "reset" | "delete") => {
    setIsSendingCode(true);
    try {
      const response = await apiFetch("/auth/send-danger-zone-code", {
        method: "POST",
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Failed to send code");

      setDangerOpen(action);
      setDangerCode("");
      setDangerError("");
      toast.success("A 6-digit code has been sent to your email.");
    } catch (error) {
      toast.error("Could not send verification code.");
    } finally {
      setIsSendingCode(false);
    }
  };
  const handleResetProgress = async () => {
    if (dangerCode.length !== 6) {
      return setDangerError("Please enter the 6-digit code.");
    }

    setIsLoading(true);
    setIsResetting(true);
    setDangerError("");

    try {
      const response = await apiFetch("/users/profile/progress/reset", {
        method: "POST",
        body: JSON.stringify({ code: dangerCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to reset progress");
      }

      toast.success("Progress reset successfully.");
      setDangerOpen(null);
      setDangerCode("");
      await refreshProfile();
    } catch (err: any) {
      setDangerError(err.message);
    } finally {
      setIsResetting(false);
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (dangerCode.length !== 6) {
      return setDangerError("Please enter the 6-digit code.");
    }

    setIsLoading(true);
    setIsDeleting(true);
    setDangerError("");

    try {
      const response = await apiFetch("/auth/delete-account", {
        method: "DELETE",
        body: JSON.stringify({ code: dangerCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success("Your account has been deleted.");
      logout();
      void navigate("/loginForm", { replace: true });
    } catch (err: any) {
      setDangerError(err.message);
    } finally {
      setIsDeleting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsChangingPassword(false);
        setIsChangingEmail(false);
        setIsToggling2FA(false);
        setError("");
      }
    };

    if (isChangingPassword || isChangingEmail || isToggling2FA) {
      // <-- Добавили
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChangingPassword, isChangingEmail, isToggling2FA]);

  useEffect(() => {
    setName(user.name);
    setJob(user.workField);
    setEducation(user.education);
    setHobbies(user.hobbies ?? []);
    setFavoriteGenreIds(user.favoriteGenres ?? []);
    setHatedGenreIds(user.hatedGenres ?? []);
  }, [user]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch("/genres", { method: "GET" });
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (!Array.isArray(data)) return;
        setGenreOptions(
          data
            .map((g) => {
              const r = g as Record<string, unknown>;
              const id = Number(r.id);
              const name = String(r.name ?? "");
              if (!Number.isFinite(id) || !name) return null;
              return { id, name };
            })
            .filter(Boolean) as GenreOption[],
        );
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const addHobby = useCallback(() => {
    const t = newHobby.trim();
    if (t && !hobbies.includes(t)) {
      setHobbies([...hobbies, t]);
      setNewHobby("");
    }
  }, [hobbies, newHobby]);

  const toggleGenrePair = useCallback(
    (genreId: number, mode: "favorite" | "hated") => {
      if (mode === "favorite") {
        setFavoriteGenreIds((prev) => {
          const has = prev.includes(genreId);
          if (has) return prev.filter((x) => x !== genreId);
          return [...prev, genreId];
        });
        setHatedGenreIds((h) => h.filter((x) => x !== genreId));
      } else {
        setHatedGenreIds((prev) => {
          const has = prev.includes(genreId);
          if (has) return prev.filter((x) => x !== genreId);
          return [...prev, genreId];
        });
        setFavoriteGenreIds((f) => f.filter((x) => x !== genreId));
      }
    },
    [],
  );

  const handleCancelProfile = useCallback(() => {
    if (!user) return;
    setName(user.name || "");
    setDateOfBirth(
      user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
    );
    setJob(user.workField || "");
    setEducation(user.education || "");
    setHobbies(user.hobbies ?? []);
    setFavoriteGenreIds(user.favoriteGenres ?? []);
    setHatedGenreIds(user.hatedGenres ?? []);
    setNewHobby("");
  }, [user]);

  const saveProfile = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(s.nameRequiredToast);
      return;
    }
    setSaving(true);
    try {
      const id = Number(user.id);
      const res = await apiFetch(`/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          dateOfBirth: dateOfBirth === "" ? null : dateOfBirth,
          workField: job.trim(),
          education: education.trim(),
          hobbies,
          favoriteGenres: favoriteGenreIds,
          hatedGenres: hatedGenreIds,
        }),
      });
      if (!res.ok) {
        toast.error(await getResponseErrorMessage(res));
        return;
      }
      toast.success(s.profileSavedToast);
      await onSaved();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : s.saveProfileError);
    } finally {
      setSaving(false);
    }
  }, [
    name,
    dateOfBirth,
    job,
    education,
    hobbies,
    favoriteGenreIds,
    hatedGenreIds,
    user.id,
    onSaved,
    s.nameRequiredToast,
    s.profileSavedToast,
    s.saveProfileError,
  ]);

  return (
    <div className="space-y-6">
      <ProfileCard
        title={
          <span className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            {s.cardProfileInfo || "Profile Information"}
          </span>
        }
      >
        <p className="mb-6 text-sm text-muted-foreground">
          {s.cardProfileInfoLead || "Manage your profile details."}
        </p>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                {s.labelFullName || "Full Name"}
              </span>
              <InputText
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                {s.labelEmail || "Email Address"}
              </span>
              <InputText value={email} disabled className="opacity-70" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                {s.labelJob || "Field of Work / Profession"}
              </span>
              <InputText
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder={s.placeholderJob || "e.g., Software Engineer"}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                {s.labelEducation || "Education"}
              </span>
              <InputText
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder={
                  s.placeholderEducation || "e.g., Bachelor's Degree"
                }
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Date of Birth <span className="text-destructive">*</span>
            </label>
            <DatePicker
              selected={dateOfBirth ? new Date(dateOfBirth) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setDateOfBirth(date.toISOString().split("T")[0]);
                } else {
                  setDateOfBirth("");
                }
              }}
              dateFormat="yyyy-MM-dd"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              minDate={new Date("1900-01-01")}
              maxDate={new Date()}
              wrapperClassName="w-full"
              portalId="calendar-portal"
              preventOpenOnFocus={true}
              customInput={
                <CustomDateInput id="profile-dob" isError={!dateOfBirth} />
              }
            />
            {!dateOfBirth && (
              <p className="text-[13px] font-medium text-destructive mt-1">
                Date of birth is required
              </p>
            )}
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-foreground">
              {s.hobbiesHeading || "Hobbies"}
            </span>
            <div className="mb-2 flex flex-wrap gap-2">
              {hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-1 text-sm text-primary"
                >
                  {hobby}
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-primary/20"
                    onClick={() =>
                      setHobbies((prev) => prev.filter((h) => h !== hobby))
                    }
                    aria-label={formatMessage(
                      s.removeHobbyAria || "Remove {name}",
                      {
                        name: hobby,
                      },
                    )}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <InputText
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                placeholder={s.placeholderHobby || "Add a hobby..."}
                onKeyDown={(e) => e.key === "Enter" && addHobby()}
                className="flex-1"
              />
              <button
                type="button"
                onClick={addHobby}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-muted"
                aria-label={s.addHobbyAria || "Add hobby"}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <hr className="border-border/60" />

          <div>
            <span className="mb-1 block text-sm font-medium text-foreground">
              {s.genresHeading || "Genres"}
            </span>
            <p className="mb-4 text-sm text-muted-foreground">
              {s.genresLead || "Select your preferred or avoided genres."}
            </p>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((g) => {
                const loved = favoriteGenreIds.includes(g.id);
                const hated = hatedGenreIds.includes(g.id);
                return (
                  <div key={g.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleGenrePair(g.id, "favorite")}
                      className={`rounded-l-lg px-3 py-1.5 text-sm hover:cursor-pointer font-medium transition-colors ${
                        loved
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {g.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleGenrePair(g.id, "hated")}
                      className={`rounded-r-lg px-2 py-1.5 hover:cursor-pointer transition-colors ${
                        hated
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-secondary/80 text-muted-foreground hover:bg-muted"
                      }`}
                      aria-label={formatMessage(
                        s.avoidGenreAria || "Avoid {name}",
                        {
                          name: g.name,
                        },
                      )}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-3 rounded bg-accent" />{" "}
                {s.genreLegendPrefer || "Preferred"}
              </span>
              <span className="flex items-center gap-1">
                <span className="size-3 rounded bg-destructive" />{" "}
                {s.genreLegendAvoid || "Avoided"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-6">
          <button
            type="button"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
            disabled={saving}
            onClick={handleCancelProfile}
          >
            {s.cancel}
          </button>
          <button
            type="button"
            className="flex w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            disabled={saving}
            onClick={() => void saveProfile()}
          >
            <Save className="size-4 mr-2" />
            {saving ? s.saving || "Saving..." : s.saveChanges || "Save Changes"}
          </button>
        </div>
      </ProfileCard>

      <ProfileCard
        title={
          <span className="flex items-center gap-2">
            <Monitor className="size-5 text-primary" />
            {s.displayLang}
          </span>
        }
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {s.customizeDisplay}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 py-2">
          {/* Выбор темы (Слева) */}
          <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 hover:bg-muted/20 transition-colors">
            <div>
              <p className="font-medium text-foreground">{s.theme}</p>
              <p className="text-sm text-muted-foreground">{s.lightOrDark}</p>
            </div>
            <div className="mt-auto flex w-fit bg-secondary/50 rounded-lg p-1 border border-border/50">
              <button
                type="button"
                onClick={() => applyTheme(false)}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                  !isDarkMode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.light}
              </button>
              <button
                type="button"
                onClick={() => applyTheme(true)}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors hover:cursor-pointer ${
                  isDarkMode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.dark}
              </button>
            </div>
          </div>

          {/* Выбор языка (Справа) */}
          <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 hover:bg-muted/20 transition-colors">
            <div>
              <p className="font-medium text-foreground">{s.language}</p>
              <p className="text-sm text-muted-foreground">{s.interfaceLang}</p>
            </div>
            <div className="mt-auto flex w-fit bg-secondary/50 rounded-lg p-1 border border-border/50">
              <button
                type="button"
                onClick={() => setLocale?.("en")}
                className={`px-5 py-1.5 text-sm font-medium rounded-md uppercase transition-colors hover:cursor-pointer ${
                  locale === "en"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.en}
              </button>
              <button
                type="button"
                onClick={() => setLocale?.("uk")}
                className={`px-5 py-1.5 text-sm font-medium rounded-md uppercase transition-colors hover:cursor-pointer ${
                  locale === "uk"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.uk}
              </button>
            </div>
          </div>
        </div>
      </ProfileCard>

      <ProfileCard
        title={
          <span className="flex items-center gap-2">
            <Lock className="size-5" />
            {s.securityLogin}
          </span>
        }
      >
        <div className="space-y-4">
          {!isTeacherStudent && (
            <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                  <div>
                    <p className="font-medium text-foreground text-left">
                      {s.email}
                    </p>
                    <button
                      onClick={() => setIsChangeEmailModalOpen(true)}
                      className="text-sm text-muted-foreground text-left hover:underline transition-colors"
                    >
                      {maskEmail(user?.email)}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartEmailChange}
                  className="shrink-0 rounded-xl px-5 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {s.changeEmail}
                </button>

                {isChangingEmail && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                      <div className="flex items-start justify-between p-8 pb-6">
                        <div>
                          <h2 className="text-3xl font-bold">
                            {s.updateEmail}
                          </h2>
                          <p className="text-base text-muted-foreground mt-2">
                            {emailChangeStep === 1
                              ? `${s.sendCode}${" "}
                                ${maskEmail(user?.email)}
                                ${s.enterBelow}`
                              : s.enterNewEmail}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsChangingEmail(false)}
                          className="p-1 rounded-sm text-muted-foreground hover:cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="p-8 pt-0 space-y-5">
                        {error && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                            {error}
                          </div>
                        )}

                        {emailChangeStep === 1 ? (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {s.verCode}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={emailChangeCode}
                              onChange={(e) =>
                                setEmailChangeCode(
                                  e.target.value.replace(/\D/g, ""),
                                )
                              }
                              placeholder="• • • • • •"
                              autoFocus
                              className="flex h-14 w-full rounded-lg border border-input bg-background px-4 py-2 text-2xl text-foreground text-center tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {s.newEmail}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                autoFocus
                                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {s.confirmEmail}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={confirmNewEmail}
                                onChange={(e) =>
                                  setConfirmNewEmail(e.target.value)
                                }
                                onPaste={(e) => e.preventDefault()}
                                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 px-8 flex items-center justify-end gap-4 rounded-b-2xl bg-muted/30 border-t border-border">
                        <button
                          onClick={() => setIsChangingEmail(false)}
                          className="px-5 py-3 text-sm font-medium hover:underline hover:cursor-pointer"
                        >
                          {s.cancel}
                        </button>
                        <button
                          onClick={handleEmailUpdate}
                          disabled={
                            isLoading ||
                            (emailChangeStep === 1 &&
                              emailChangeCode.length !== 6)
                          }
                          className="flex rounded-[15px] bg-primary px-6 py-2 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
                        >
                          {isLoading
                            ? s.processing
                            : emailChangeStep === 1
                              ? s.next
                              : s.done}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                    <div>
                      <p className="font-medium text-foreground text-left">
                        {s.password}
                      </p>
                      <p className="text-sm text-muted-foreground text-left">
                        {s.updatePassToKeep}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(true)}
                      className="shrink-0 rounded-xl px-5 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {s.changePass}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
                      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between p-8 pb-6">
                          <div>
                            <h2 className="text-3xl font-bold">
                              {s.updatePass}
                            </h2>
                            <p className="text-base text-muted-foreground mt-2">
                              {s.enterCurrent}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setError("");
                            }}
                            className="p-1 rounded-sm text-muted-foreground hover:cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="p-8 pt-0 space-y-7">
                          {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                              {error}
                            </div>
                          )}

                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                              {s.currentPass}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              autoComplete="current-password"
                              placeholder="Enter your current password"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              className="flex h-12 w-full mt-3 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                              {s.newPass}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Enter your new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="flex h-12 w-full mt-3 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                              {s.confirmPass}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              autoComplete="new-password"
                              placeholder="Confirm your new password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="flex h-12 w-full mt-3 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                            />
                          </div>
                        </div>

                        <div className="p-3 px-8 flex items-center justify-end gap-4 rounded-b-2xl bg-muted/30 border-t border-border">
                          <button
                            type="button"
                            onClick={() => {
                              setIsChangingPassword(false);
                              setError("");
                            }}
                            disabled={isLoading}
                            className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                          >
                            {s.cancel}
                          </button>
                          <button
                            type="button"
                            onClick={handlePasswordUpdate}
                            disabled={isLoading}
                            className="flex rounded-[15px] bg-primary px-6 py-2 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
                          >
                            {isLoading ? (
                              <>
                                <svg
                                  className="animate-spin h-5 w-5 text-primary-foreground"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                {s.saving}
                              </>
                            ) : (
                              "Done"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              </div>
            </>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
            <div>
              <p className="font-medium text-foreground">{s.twoFactor}</p>
              <p className="text-sm text-muted-foreground">{s.extraLayer}</p>
            </div>

            <ToggleSwitch
              key={`${user?.isTwoFactorEnable}-${isToggling2FA}`}
              checked={!!user?.isTwoFactorEnable}
              onCheckedChange={handleToggle2FAClick}
            />

            {isToggling2FA && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between p-8 pb-6">
                    <div>
                      <h2 className="text-3xl font-bold">
                        {target2FAState ? "Enable" : "Disable"} 2FA
                      </h2>
                      <p className="text-base text-muted-foreground mt-2">
                        Please enter your password to confirm this change.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsToggling2FA(false);
                        setError("");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="p-8 pt-0 space-y-7">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                        {error}
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="mb-4 block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        Current Password <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="password"
                        autoComplete="current-password"
                        className="hidden"
                      />

                      <input
                        type="password"
                        autoComplete="new-password"
                        value={twoFactorPassword}
                        onChange={(e) => setTwoFactorPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoFocus
                        className="flex h-14 w-full rounded-lg border border-input bg-background px-4 py-3 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsToggling2FA(false);
                            setError("");
                          } else if (
                            e.key === "Enter" &&
                            twoFactorPassword &&
                            !isLoading
                          ) {
                            e.preventDefault();
                            void handleConfirm2FAToggle();
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-6 px-8 flex items-center justify-end gap-4 rounded-b-2xl bg-muted/30 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsToggling2FA(false);
                        setError("");
                      }}
                      disabled={isLoading}
                      className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {s.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm2FAToggle}
                      disabled={isLoading || !twoFactorPassword}
                      className="rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-primary-foreground"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Confirming...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProfileCard>

      <ProfileCard
        title={
          <span className="flex items-center gap-2 text-destructive">
            <Shield className="size-5" />
            {s.cardDangerZone || "Danger Zone"}
          </span>
        }
        className="border-destructive/30"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-lg bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                {s.logoutTitle || "Sign Out"}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.logoutDesc || "Sign out of your account."}
              </p>
            </div>
            <div className="w-full flex justify-center sm:block sm:w-auto">
              <button
                type="button"
                className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-destructive/10 px-6 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 cursor-pointer"
                onClick={async () => {
                  try {
                    await apiFetch("/auth/logout", { method: "POST" });
                  } catch (e) {
                    console.error("Server logout request failed:", e);
                  }
                  logout();
                  setStoredAccessToken(null);
                  toast.success(s?.signOutToast || "Signed out successfully");
                  window.location.href = "/loginForm";
                }}
              >
                <LogOut className="size-4 pt-1 pr-1" />
                {s.logoutCta || "Sign Out"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-lg bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                {s.resetProgressTitle || "Reset Progress"}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.resetProgressDesc || "Reset your learning analytics."}
              </p>
            </div>
            <button
              type="button"
              className="flex w-full sm:w-auto justify-center items-center rounded-xl bg-destructive/10 px-6 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 cursor-pointer disabled:opacity-50"
              onClick={() => handleOpenDangerZone("reset")}
              disabled={isSendingCode}
            >
              {isSendingCode && dangerOpen !== "reset"
                ? "Sending..."
                : s.resetProgressCta || "Reset Progress"}
            </button>
          </div>

          {!isTeacherStudent && (
            <div className="flex flex-col gap-4 rounded-lg bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {s.deleteAccountTitle || "Delete Account"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {s.deleteAccountDesc || "Permanently delete your account."}
                </p>
              </div>
              <div className="flex justify-center sm:block">
                <button
                  type="button"
                  className="flex w-full sm:w-auto justify-center items-center rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 cursor-pointer shadow-sm disabled:opacity-50"
                  onClick={() => handleOpenDangerZone("delete")}
                  disabled={isSendingCode}
                >
                  {isSendingCode && dangerOpen !== "delete"
                    ? "Sending..."
                    : s.deleteAccountCta || "Delete Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </ProfileCard>

      {dangerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            setDangerOpen(null);
            setDangerCode("");
            setDangerError("");
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              className={`text-xl font-bold ${dangerOpen === "delete" ? "text-red-500" : "text-foreground"}`}
            >
              {dangerOpen === "reset"
                ? s.dangerReset || "Reset Progress"
                : s.dangerDelete || "Delete Account"}
            </h4>

            <p className="mt-2 text-sm text-muted-foreground">
              {dangerOpen === "reset"
                ? "This action cannot be undone. All your saved words, video viewing history, XP, and test results will be permanently deleted."
                : "This action cannot be undone. Your account will be scheduled for permanent deletion."}
              <br />
              <br />
              We sent a 6-digit code to{" "}
              <strong>{maskEmail(user?.email)}</strong>. Enter it below to
              confirm.
            </p>

            {dangerError && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {dangerError}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Verification Code <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                maxLength={6}
                value={dangerCode}
                onChange={(e) =>
                  setDangerCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="• • • • • •"
                autoFocus
                className="flex h-14 w-full rounded-lg border border-input bg-background px-4 py-2 text-2xl text-foreground text-center tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setDangerOpen(null);
                    setDangerCode("");
                    setDangerError("");
                  } else if (e.key === "Enter" && dangerCode.length === 6) {
                    dangerOpen === "reset"
                      ? handleResetProgress()
                      : handleDeleteAccount();
                  }
                }}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                onClick={() => {
                  setDangerOpen(null);
                  setDangerCode("");
                  setDangerError("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={
                  dangerOpen === "reset"
                    ? handleResetProgress
                    : handleDeleteAccount
                }
                disabled={
                  (dangerOpen === "reset" ? isResetting : isDeleting) ||
                  dangerCode.length !== 6
                }
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {dangerOpen === "reset"
                  ? isResetting
                    ? "Resetting..."
                    : "Reset progress"
                  : isDeleting
                    ? "Deleting..."
                    : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
