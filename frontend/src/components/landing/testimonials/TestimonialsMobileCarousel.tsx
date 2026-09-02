import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, Users } from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  initialsFromName,
  type TestimonialItem,
} from "./testimonial-utils";

type TestimonialsMobileCarouselProps = {
  title: string;
  subtitle: string;
  items: readonly TestimonialItem[];
};

/**
 * Mobile-only swipe carousel for learner testimonials.
 */
export function TestimonialsMobileCarousel({
  title,
  subtitle,
  items,
}: TestimonialsMobileCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track || items.length === 0) {
      return;
    }
    const cardWidth = track.scrollWidth / items.length;
    const index = Math.round(track.scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1));
  }, [items.length]);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track || items.length === 0) {
      return;
    }
    const nextIndex = Math.min(Math.max(index, 0), items.length - 1);
    const cardWidth = track.scrollWidth / items.length;
    track.scrollTo({ left: cardWidth * nextIndex, behavior: "smooth" });
    setActiveIndex(nextIndex);
  }

  return (
    <div className="md:hidden">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_24px_-8px_var(--glow)]">
          <Users className="size-5 text-glow" aria-hidden />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative -mx-4 px-4">
        <div
          ref={trackRef}
          onScroll={syncActiveIndex}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 scrollbar-hide"
        >
          {items.map((item) => (
            <figure
              key={item.name}
              className="flex w-[calc(100vw-2rem)] max-w-md shrink-0 snap-center flex-col rounded-3xl border border-primary/25 bg-card/70 p-5 shadow-[0_20px_50px_-28px_var(--glow)] backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex gap-0.5 text-glow" aria-hidden>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="size-3.5 fill-current" />
                  ))}
                </div>
                <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-glow">
                  {item.level}
                </span>
              </div>

              <Quote
                className="mb-2 size-5 text-primary/40"
                aria-hidden
              />

              <blockquote className="max-h-48 flex-1 overflow-y-auto font-sans text-sm leading-relaxed text-foreground/90">
                {item.quote}
              </blockquote>

              <figcaption className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-bold text-primary shadow-[0_0_16px_-6px_var(--glow)]"
                  aria-hidden
                >
                  {initialsFromName(item.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  {item.outcome ? (
                    <p className="truncate font-sans text-xs text-muted-foreground">
                      {item.outcome}
                    </p>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous review"
            disabled={activeIndex === 0}
            onClick={() => scrollToIndex(activeIndex - 1)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur-sm transition-colors",
              activeIndex === 0
                ? "cursor-not-allowed opacity-40"
                : "hover:border-primary/40 hover:bg-primary/10",
            )}
          >
            <ChevronLeft className="size-5" />
          </button>

          <p className="min-w-[4.5rem] text-center font-sans text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{activeIndex + 1}</span>
            <span aria-hidden="true"> / </span>
            {items.length}
          </p>

          <button
            type="button"
            aria-label="Next review"
            disabled={activeIndex === items.length - 1}
            onClick={() => scrollToIndex(activeIndex + 1)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur-sm transition-colors",
              activeIndex === items.length - 1
                ? "cursor-not-allowed opacity-40"
                : "hover:border-primary/40 hover:bg-primary/10",
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
