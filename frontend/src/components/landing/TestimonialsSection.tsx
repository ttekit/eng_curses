import { useLandingLocale } from "../../context/LandingLocaleContext";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function TestimonialsSection() {
  const { messages } = useLandingLocale();
  const { testimonials } = messages;

  return (
    <section
      id="testimonials"
      className="scroll-mt-24 border-t border-border bg-background py-20 font-display"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            {testimonials.title}
          </h2>
          <p className="font-sans text-lg text-muted-foreground">
            {testimonials.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.items.map((item) => (
            <figure
              key={item.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                  aria-hidden
                >
                  {initialsFromName(item.name)}
                </div>
                <figcaption>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {item.level}
                  </p>
                </figcaption>
              </div>
              <blockquote className="font-sans text-sm leading-relaxed text-foreground/90">
                “{item.quote}”
              </blockquote>
              <p className="mt-4 font-sans text-xs text-muted-foreground">
                {item.outcome}
              </p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
