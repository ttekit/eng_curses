import { useRef } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ListVideo } from "lucide-react";
import { CatalogVideoCard, type CatalogCardVideo } from "./CatalogVideoCard";
import { useAppMessages } from "../../hooks/useAppMessages";

interface CatalogVideoRowProps {
  title: string;
  description?: string;
  videos: CatalogCardVideo[];
  showProgress?: boolean;
  /** When set, shows a link to the ordered playlist page for this series. */
  seriesFriendlyLink?: string;
  onRequestAgeVerification?: (ageRestriction: string) => void;
}

export function CatalogVideoRow({
  title,
  description,
  videos,
  showProgress,
  seriesFriendlyLink,
  onRequestAgeVerification,
}: CatalogVideoRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cb = useAppMessages().videoRow;

  const common = useAppMessages().common;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (videos.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="hidden items-center gap-2 sm:flex ">
          {seriesFriendlyLink?.trim() && videos.length > 0 ? (
            <Link
              to={`/catalog/series/${encodeURIComponent(seriesFriendlyLink.trim())}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              <ListVideo className="h-4 w-4" aria-hidden />
              {cb.playlist}
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={common.scrollLeft}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={common.scrollRight}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 overflow-x-auto">
        <div
          ref={scrollRef}
          className="flex gap-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video) => (
            <CatalogVideoCard
              key={video.id}
              video={video}
              showProgress={showProgress}
              onRequestAgeVerification={onRequestAgeVerification}
            />
          ))}
        </div>
      </div>

      <div className="mt-1 border-t border-border" />
    </section>
  );
}
