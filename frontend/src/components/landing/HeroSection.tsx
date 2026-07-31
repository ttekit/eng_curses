import { Link } from "react-router";
import { Play, Sparkles } from "lucide-react";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import VideoPlayer from "../VideoPlayer";
import { useUser } from "../../context/UserContext";
import {
  trackLandingCtaPrimary,
  trackLandingCtaSecondary,
  trackLandingHeroVideoPlay,
} from "../../lib/landingAnalytics";
import HeroStats from "./HeroStats";

export function HeroSection() {
  const { messages } = useLandingLocale();
  const { hero, cta } = messages;
  const { user } = useUser();

  const primaryTo = user ? "/catalog" : "/register";

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden border-b border-border pt-24 pb-16 font-display">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.65_0.25_295/0.15)_0%,transparent_50%)]" />
      <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {hero.badge}
              </span>
            </div>

            <h1 className="text-4xl leading-tight font-bold text-balance sm:text-5xl lg:text-6xl">
              {hero.titleBefore}{" "}
              <span className="text-primary">{hero.titleAccent}</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {hero.lead}
            </p>

            <div className="space-y-3">
              <div className="flex flex-col flex-wrap items-start gap-4 sm:flex-row">
                <Link
                  to={primaryTo}
                  onClick={() => trackLandingCtaPrimary("hero")}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-center text-lg font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  {cta.startFree}
                </Link>

                <Link
                  to="/catalog"
                  onClick={() => trackLandingCtaSecondary("hero")}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-4 text-center text-lg font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
                >
                  <Play className="h-5 w-5" />
                  {hero.ctaSecondary}
                </Link>
              </div>
              <p className="text-sm text-muted-foreground -mb-5">
                {hero.trustNoCard}
                <span aria-hidden="true"> · </span>
                {hero.trustPrivacy}
              </p>
            </div>
            <HeroStats />
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <p className="mb-4 items-start text-center font-display text-3xl sm:text-right">
                {/* {hero.videoCaption}{" "}
                <span className="text-primary">{hero.videoWatch}</span> */}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute right-60 bottom-115 z-0 hidden h-40 w-40 rounded-full bg-amber-300/30 blur-3xl animate-glow duration-100 lg:block" />

      <img
        src="/LandingPicture.png"
        className="pointer-events-none absolute right-0 bottom-0 z-10 hidden w-200 lg:block"
      />
    </section>
  );
}
