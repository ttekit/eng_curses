import { cn } from "../../lib/utils";

type GenreOption = { id: number; name: string };

type GenreChipPickerProps = {
  genreOptions: GenreOption[];
  favoriteIds: number[];
  hatedIds: number[];
  loveLabel: string;
  loveHint: string;
  avoidLabel: string;
  avoidHint: string;
  onToggleFavorite: (id: number) => void;
  onToggleHated: (id: number) => void;
};

export function GenreChipPicker({
  genreOptions,
  favoriteIds,
  hatedIds,
  loveLabel,
  loveHint,
  avoidLabel,
  avoidHint,
  onToggleFavorite,
  onToggleHated,
}: GenreChipPickerProps) {
  return (
    <>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{loveLabel}</p>
        <p className="text-sm text-muted-foreground">{loveHint}</p>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((genre) => {
            const inactive = hatedIds.includes(genre.id);
            const active = favoriteIds.includes(genre.id);
            return (
              <button
                key={`f-${genre.id}`}
                type="button"
                disabled={inactive}
                onClick={() => onToggleFavorite(genre.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{avoidLabel}</p>
        <p className="text-sm text-muted-foreground">{avoidHint}</p>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((genre) => {
            const inactive = favoriteIds.includes(genre.id);
            const active = hatedIds.includes(genre.id);
            return (
              <button
                key={`h-${genre.id}`}
                type="button"
                disabled={inactive}
                onClick={() => onToggleHated(genre.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                  active
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
