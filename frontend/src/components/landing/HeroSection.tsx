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
  const primaryTo = user ? "/profile" : "/register";

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden border-b border-border pt-24 pb-16">
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

            <h1 className="font-display text-4xl leading-tight font-bold text-balance sm:text-5xl lg:text-6xl">
              {hero.titleBefore}{" "}
              <span className="text-primary">{hero.titleAccent}</span>
            </h1>

            <p className="max-w-lg font-sans text-lg leading-relaxed text-muted-foreground sm:text-xl">
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
                  to={{ pathname: "/", hash: "#how-explys-works" }}
                  onClick={() => trackLandingCtaSecondary("hero")}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-4 text-center text-lg font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
                >
                  <Play className="h-5 w-5" />
                  {hero.ctaSecondary}
                </Link>
              </div>
              <p className="font-sans text-sm text-muted-foreground -mb-5">
                {hero.trustNoCard}
                <span aria-hidden="true"> · </span>
                {hero.trustPrivacy}
              </p>
            </div>
            <HeroStats />
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 scale-100 rounded-full bg-primary/20 blur-3xl" />
              <p className="mb-4 items-start text-center font-sans text-3xl sm:text-right">
                {hero.videoCaption}{" "}
                <span className="text-primary">{hero.videoWatch}</span>
              </p>
              <div className="h-auto w-auto rounded-[15px] bg-primary/10">
                <VideoPlayer
                  src="https://kpi-eng-course.s3.us-east-1.amazonaws.com/m3u8_videos/Landing_video/index.m3u8"
                  onPlay={trackLandingHeroVideoPlay}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
