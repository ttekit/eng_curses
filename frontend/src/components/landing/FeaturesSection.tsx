import { BarChart3, Brain, Target, Trophy, Users, Video } from "lucide-react";
import { useLandingLocale } from "../../context/LandingLocaleContext";

const featureIcons = [Video, Brain, Target, Users, Trophy, BarChart3];

export function FeaturesSection() {
  const { messages } = useLandingLocale();
  const { features } = messages;

  return (
    <section
      id="why-choose-explys"
      className="relative scroll-mt-24 py-16 font-display sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.75_0.18_145/0.06)_0%,transparent_50%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-display mb-4 text-balance text-3xl font-bold sm:text-4xl">
            {features.titleBefore}{" "}
            <span className="text-primary">{features.titleBrand}</span>
            {features.titleAfter}
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-lg text-muted-foreground">
            {features.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.items.map((feature, index) => {
            const Icon = featureIcons[index]!;
            return (
              <div
                key={feature.title}
                className="landing-card-glow group rounded-2xl border border-border bg-card/60 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-glow transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
