import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { trackLandingCtaPrimary, trackLandingCtaSecondary } from "../../lib/landingAnalytics";

export function CtaSection() {
  const { isLoggedIn } = useUser();
  const { messages } = useLandingLocale();
  const { cta } = messages;
  const primaryTo = isLoggedIn ? "/catalog" : "/registrationMain";
  const primaryLabel = isLoggedIn ? cta.catalog : cta.startFree;

  return (
    <section
      id="ready-to-start"
      className="relative scroll-mt-24 overflow-hidden py-24 font-display"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.65_0.25_295/0.2)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <img src="/Greeting.svg" className="h-46 w-38 animate-float" alt="" />
        </div>

        <h2 className="mb-6 text-balance text-3xl font-bold sm:text-4xl lg:text-5xl">
          {cta.titleBefore}{" "}
          <span className="text-primary">{cta.titleAccent}</span>
          {cta.titleAfter}
        </h2>

        <p className="mx-auto mb-8 max-w-2xl font-sans text-lg text-muted-foreground">
          {cta.subtitle}
        </p>

        <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to={primaryTo}
            onClick={() => trackLandingCtaPrimary("bottom")}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
            >
              {primaryLabel}
              <ArrowRight className="h-6 w-6 shrink-0" />
            </button>
          </Link>
          <Link
            to={{ pathname: "/", hash: "#how-explys-works" }}
            onClick={() => trackLandingCtaSecondary("bottom")}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
          >
            {cta.howItWorks}
          </Link>
        </div>

        <p className="mt-6 font-sans text-sm text-muted-foreground">
          {cta.trustNoCard}
          <span aria-hidden="true"> · </span>
          {cta.trustPrivacy}
        </p>
        <p className="mt-2 font-sans text-sm text-muted-foreground/80">
          {cta.footnotePromo}
        </p>
      </div>
    </section>
  );
}
