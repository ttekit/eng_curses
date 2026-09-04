import { useLandingLocale } from "../../context/LandingLocaleContext";
import { TestimonialsMobileCarousel } from "./testimonials/TestimonialsMobileCarousel";
import { initialsFromName } from "./testimonials/testimonial-utils";

export function TestimonialsSection() {
  const { messages } = useLandingLocale();
  const { testimonials } = messages;

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 border-t border-b border-border/60 bg-background/40 py-12 font-display backdrop-blur-[2px] sm:py-15"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TestimonialsMobileCarousel
          title={testimonials.title}
          subtitle={testimonials.subtitle}
          items={testimonials.items}
        />

        <div className="hidden md:block">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold">{testimonials.title}</h2>
            <p className="font-sans text-lg text-muted-foreground">
              {testimonials.subtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-[0_24px_60px_-40px_var(--glow)] backdrop-blur-sm">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.items.map((item) => (
                <figure
                  key={item.name}
                  className="landing-card-glow flex flex-col rounded-2xl border border-border bg-card/70 p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                      aria-hidden
                    >
                      {initialsFromName(item.name)}
                    </div>
                    <figcaption className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">
                        {item.level}
                      </p>
                    </figcaption>
                  </div>
                  <blockquote className="font-sans text-sm leading-relaxed text-foreground/90">
                    “{item.quote}”
                  </blockquote>
                  {item.outcome ? (
                    <p className="mt-4 font-sans text-xs text-muted-foreground">
                      {item.outcome}
                    </p>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
