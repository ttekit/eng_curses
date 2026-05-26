import { useNavigate } from "react-router";
import { Info, Play, Star } from "lucide-react";

export interface CatalogHeroVideo {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  thumbnailUrl?: string;
}

interface CatalogHeroProps {
  featured: CatalogHeroVideo | null;
}

export function CatalogHero({ featured }: CatalogHeroProps) {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-125 h-[70vh] items-end overflow-hidden bg-background">
      {featured?.thumbnailUrl ? (
        <div className="absolute inset-0 z-0">
          <img
            src={featured.thumbnailUrl}
            alt={featured.title}
            className="h-full w-full object-cover object-[75%_center] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent sm:via-background/70" />
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.65_0.25_295/0.3)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-card/60" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
            Featured
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" />
            4.9
          </span>
          {featured ? (
            <span className="text-sm text-muted-foreground">
              {featured.categoryName}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Browse below</span>
          )}
        </div>

        <h1 className="font-lexend mb-4 text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
          {featured ? featured.title : "Your English catalog"}
        </h1>

        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {featured
            ? featured.description
            : "Pick a lane and learn from curated video clips. Content updates as your library grows."}
        </p>

        <div className="mb-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Fresh picks</span>
          <span className="flex h-1 w-1 items-center justify-center">
            <span className="h-1 w-1 rounded-full bg-muted-foreground mt-4" />
          </span>
          <span>Video + quizzes</span>
          <span className="flex h-1 w-1 items-center justify-center">
            <span className="h-1 w-1 rounded-full bg-muted-foreground mt-4" />
          </span>
          <span>Levels for every learner</span>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            disabled={!featured}
            onClick={() => featured && navigate(`/content/${featured.id}`)}
            className=" flex rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
          >
            <Play className="h-5 w-5 fill-current pr-2" />
            Start Watching
          </button>
          <button
            type="button"
            onClick={() => {
              document.getElementById("catalog-library")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            className="flex text-foreground/70 hover:text-white rounded-[15px] px-3 items-center justify-center gap-2 hover:cursor-pointer rounded-xlpx-8 py-4 text-sm font-semibold transition-colors hover:bg-muted-foreground/10"
          >
            <Info className="h-5 w-5" />
            Browse library
          </button>
        </div>
      </div>
    </section>
  );
}
