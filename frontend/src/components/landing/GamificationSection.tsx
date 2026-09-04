import { useLandingLocale } from "../../context/LandingLocaleContext";

const PANEL =
  "relative overflow-hidden rounded-2xl border-2 border-foreground/20 bg-card p-4 shadow-[6px_6px_0_0_color-mix(in_oklch,var(--color-foreground)_18%,transparent)] sm:p-5";
const FRAME =
  "overflow-hidden rounded-xl border-2 border-foreground/20 shadow-[4px_4px_0_0_color-mix(in_oklch,var(--color-foreground)_18%,transparent)]";
const TAG =
  "inline-block -rotate-2 rounded-md border-2 border-foreground/20 bg-background px-3 py-1 text-xs font-black uppercase tracking-wide text-foreground";

type StripData = {
  label: string;
  from: string;
  fromAlt: string;
  to: string;
  toAlt: string;
  burst: string;
};

function ComicStrip({
  label,
  from,
  fromAlt,
  to,
  toAlt,
  burst,
  rotate,
}: StripData & { rotate: string }) {
  return (
    <div className={`${PANEL} ${rotate}`}>
      <span className={`relative mb-3 block w-fit ${TAG}`}>{label}</span>

      <div className="relative flex flex-col items-center">
        <img
          src={from}
          alt={fromAlt}
          className={`${FRAME} block h-auto w-full max-w-xs`}
          loading="lazy"
        />

        <div className="relative flex h-10 w-full items-center justify-center sm:h-12">
          <svg
            viewBox="0 0 60 100"
            className="h-8 w-6 text-foreground/70 sm:h-10"
            fill="none"
          >
            <path
              d="M30 2 V60"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M10 48 L30 90 L50 48"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute left-1/2 top-1/2 max-w-[42%] -translate-y-1/2 translate-x-3 -rotate-2 truncate rounded-full border-2 border-foreground/20 bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary-foreground shadow-[3px_3px_0_0_color-mix(in_oklch,var(--color-foreground)_18%,transparent)] sm:max-w-none sm:translate-x-8 sm:whitespace-nowrap sm:px-2.5 sm:text-xs">
            {burst}
          </span>
        </div>

        <img
          src={to}
          alt={toAlt}
          className={`${FRAME} block h-auto w-full max-w-xs`}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function GamificationSection() {
  const { messages } = useLandingLocale();
  const { gamification } = messages;

  return (
    <section
      id="gamification"
      className="relative scroll-mt-24 py-12 font-display sm:py-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.75_0.18_145/0.08)_0%,transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <span
            className={`mb-3 ${TAG} rounded-full bg-primary text-primary-foreground`}
          >
            {gamification.eyebrow}
          </span>
          <h2 className="mb-3 text-balance text-2xl font-bold sm:text-3xl">
            {gamification.title}{" "}
            <span className="text-primary">{gamification.titleAccent}</span>
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-base text-muted-foreground">
            {gamification.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {gamification.strips.map((strip, i) => (
            <ComicStrip
              key={strip.label}
              {...strip}
              rotate={i === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}
            />
          ))}
        </div>

        <div className={`${PANEL} mt-6`}>
          <div className="relative mb-4 flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <span className={TAG}>{gamification.achievementLabel}</span>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
              {gamification.achievementTitle}
            </h3>
            <p className="max-w-xl font-sans text-sm leading-relaxed text-muted-foreground">
              {gamification.achievementText}
            </p>
          </div>
          <img
            src="/achievement.jpg"
            alt={gamification.achievementTitle}
            className={`${FRAME} relative block h-auto w-full`}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
