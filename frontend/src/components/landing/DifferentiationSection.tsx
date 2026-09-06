import { ShieldCheck, CreditCard, Subtitles, Sparkles } from "lucide-react";
import { useLandingLocale } from "../../context/LandingLocaleContext";

const differentiationIcons = [ShieldCheck, CreditCard, Subtitles, Sparkles];

export function DifferentiationSection() {
  const { messages } = useLandingLocale();
  const { differentiation } = messages;

  return (
    <section
      id="why-explys-different"
      className="relative scroll-mt-24 border-t border-border/60 bg-background/40 py-12 font-display backdrop-blur-[2px] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl">
            {differentiation.titleBefore}{" "}
            <span className="text-primary">{differentiation.titleBrand}</span>{" "}
            {differentiation.titleAfter}
          </h2>
          <p className="font-sans text-lg text-muted-foreground">
            {differentiation.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {differentiation.items.map((item, index) => {
            const Icon = differentiationIcons[index] ?? Sparkles;
            return (
              <div
                key={item.title}
                className="landing-card-glow rounded-2xl border border-border bg-card/60 p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
