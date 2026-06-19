import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import InputText from "../InputText";
import Button from "../Button";
import { GenreChipPicker } from "./GenreChipPicker";
import { apiFetch, readApiErrorBody } from "../../lib/api";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";

type GenreOption = { id: number; name: string };

type LearnerCustomiseFormProps = {
  initialJob: string;
  initialEducation: string;
  initialHobbies: string[];
  initialFavoriteGenres: number[];
  initialHatedGenres: number[];
  onSaved: () => Promise<void>;
};

export function LearnerCustomiseForm({
  initialJob,
  initialEducation,
  initialHobbies,
  initialFavoriteGenres,
  initialHatedGenres,
  onSaved,
}: LearnerCustomiseFormProps) {
  const c = useAppMessages().customisePage;
  const s = useAppMessages().profileSettings;
  const genresI18n = useAppMessages().genresList;

  const [job, setJob] = useState(initialJob);
  const [education, setEducation] = useState(initialEducation);
  const [hobbies, setHobbies] = useState(initialHobbies);
  const [newHobby, setNewHobby] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(initialFavoriteGenres);
  const [hatedIds, setHatedIds] = useState(initialHatedGenres);
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await apiFetch("/genres");
        if (!response.ok) return;
        const data = (await response.json()) as { id: number; name: string }[];

        const localizedData = data.map((g) => ({
          id: g.id,
          name: (genresI18n as Record<string, string>)[g.name] || g.name,
        }));

        setGenreOptions(localizedData);
      } catch {
        // ignore
      }
    })();
  }, [genresI18n]);

  const toggleFavorite = useCallback(
    (id: number) => {
      if (hatedIds.includes(id)) return;
      setFavoriteIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        setHatedIds((hated) => hated.filter((h) => !next.includes(h)));
        return next;
      });
    },
    [hatedIds],
  );

  const toggleHated = useCallback(
    (id: number) => {
      if (favoriteIds.includes(id)) return;
      setHatedIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        setFavoriteIds((fav) => fav.filter((f) => !next.includes(f)));
        return next;
      });
    },
    [favoriteIds],
  );

  const add_hobby = () => {
    const trimmed = newHobby.trim();
    if (!trimmed || hobbies.includes(trimmed)) return;
    setHobbies([...hobbies, trimmed]);
    setNewHobby("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiFetch("/auth/update-preferences", {
        method: "POST",
        body: JSON.stringify({
          workField: job.trim(),
          education: education.trim(),
          hobbies,
          favoriteGenres: favoriteIds,
          hatedGenres: hatedIds,
        }),
      });
      if (!response.ok) {
        toast.error(await readApiErrorBody(response));
        return;
      }
      await onSaved();
      toast.success(c.saveSuccess);
    } catch {
      toast.error(c.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={(e) => void handleSubmit(e)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">
            {c.jobLabel}
          </span>
          <InputText
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder={s.placeholderJob}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">
            {c.educationLabel}
          </span>
          <InputText
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder={s.placeholderEducation}
          />
        </label>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          {c.hobbiesLabel}
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
                aria-label={formatMessage(s.removeHobbyAria, { name: hobby })}
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
            placeholder={s.placeholderHobby}
            onKeyDown={(ev) =>
              ev.key === "Enter" && (ev.preventDefault(), add_hobby())
            }
            className="flex-1"
          />
          <button
            type="button"
            onClick={add_hobby}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-muted"
            aria-label={s.addHobbyAria}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <GenreChipPicker
        genreOptions={genreOptions}
        favoriteIds={favoriteIds}
        hatedIds={hatedIds}
        loveLabel={c.genresLove}
        loveHint={c.genresLoveHint}
        avoidLabel={c.genresAvoid}
        avoidHint={c.genresAvoidHint}
        onToggleFavorite={toggleFavorite}
        onToggleHated={toggleHated}
      />

      <Button
        type="submit"
        disabled={saving}
        className="inline-flex w-auto items-center gap-2 px-8"
      >
        <Save className="size-4" />
        {saving ? c.saving : c.save}
      </Button>
    </form>
  );
}
