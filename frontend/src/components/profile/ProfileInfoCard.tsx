import { useCallback, useEffect, useState, forwardRef } from "react";
import toast from "react-hot-toast";
import { Plus, Save, User, X, CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import InputText from "../InputText";
import { ProfileCard } from "./ProfileCard";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import type { DatePickerInputProps } from "../../types/date-picker-input";

type GenreOption = { id: number; name: string };

const CustomDateInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  (props, ref) => {
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
  },
);
CustomDateInput.displayName = "CustomDateInput";

export function ProfileInfoCard({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user } = useUser();
  const s = useAppMessages().profileSettings;
  const genresI18n = useAppMessages().genresList;

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(() => {
    if (!user?.dateOfBirth) return "";
    return new Date(user.dateOfBirth).toISOString().split("T")[0];
  });
  const [job, setJob] = useState(user?.workField || "");
  const [education, setEducation] = useState(user?.education || "");

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

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setJob(user.workField || "");
      setEducation(user.education || "");
      setHobbies(user.hobbies ?? []);
      setFavoriteGenreIds(user.favoriteGenres ?? []);
      setHatedGenreIds(user.hatedGenres ?? []);
    }
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
              const originalName = String(r.name ?? "");
              if (!Number.isFinite(id) || !originalName) return null;
              return {
                id,
                name:
                  (genresI18n as Record<string, string>)[originalName] ||
                  originalName,
              };
            })
            .filter(Boolean) as GenreOption[],
        );
      } catch {
        /* ignore */
      }
    })();
  }, [genresI18n]);

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
    if (!user) return;
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
    user,
    onSaved,
    s.nameRequiredToast,
    s.profileSavedToast,
    s.saveProfileError,
  ]);

  if (!user) return null;

  return (
    <ProfileCard
      title={
        <span className="flex items-center gap-2">
          <User className="size-5 text-primary" />
          {s.cardProfileInfo}
        </span>
      }
    >
      <p className="mb-6 text-sm text-muted-foreground">
        {s.cardProfileInfoLead}
      </p>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              {s.labelFullName}
            </span>
            <InputText
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              {s.labelEmail}
            </span>
            <InputText value={email} disabled className="opacity-70" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              {s.labelJob}
            </span>
            <InputText
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder={s.placeholderJob}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              {s.labelEducation}
            </span>
            <InputText
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder={s.placeholderEducation}
            />
          </label>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            {s.dateOfBirthLabel} <span className="text-destructive">*</span>
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
              {s.dateOfBirthRequired}
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
                  aria-label={formatMessage(s.removeHobbyAria, {
                    name: hobby,
                  })}
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
              aria-label={s.addHobbyAria}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <hr className="border-border/60" />

        <div>
          <span className="mb-1 block text-sm font-medium text-foreground">
            {s.genresHeading}
          </span>
          <p className="mb-4 text-sm text-muted-foreground">{s.genresLead}</p>
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
              {s.genreLegendPrefer}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-3 rounded bg-destructive" />{" "}
              {s.genreLegendAvoid}
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
          {saving ? s.saving : s.saveChanges}
        </button>
      </div>
    </ProfileCard>
  );
}
