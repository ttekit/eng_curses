import { Link } from "react-router";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import PricingCards from "../pricing/PricingCards";
import { useUser } from "../../context/UserContext";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import {
  trackLandingCtaPrimary,
  trackLandingPricingPlanClick,
} from "../../lib/landingAnalytics";

/**
 * Pricing grid for the marketing home page (same plans as /pricing).
 */
export function LandingPricingSection() {
  const { isLoggedIn } = useUser();
  const { startCheckout, checkoutLoading } = usePricingCheckout();
  const { messages } = useLandingLocale();
  const { pricingSection, cta } = messages;

  return (
    <section
      id="pricing"
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-border/60 py-12 font-display sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.65_0.25_295/0.1)_0%,transparent_55%)]" />
        <div className="absolute top-24 -left-32 size-80 animate-aurora rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute right-0 bottom-0 size-72 animate-aurora rounded-full bg-[color-mix(in_oklch,var(--nebula)_25%,transparent)] blur-[100px] [animation-delay:-8s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="relative mx-auto mb-10 max-w-3xl overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/70 to-background/60 p-6 text-center backdrop-blur-sm sm:mb-14 sm:rounded-[2rem] sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-56 animate-aurora rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative">
            <span className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-glow backdrop-blur-sm">
              <Sparkles className="size-3.5 animate-pulse-glow" aria-hidden />
              {pricingSection.freePromo}
            </span>

            <div className="space-y-1">
              <p className="font-display text-xl font-semibold text-foreground sm:text-3xl">
                {pricingSection.freeHeadline}
                <span className="animate-gradient-text bg-gradient-to-r from-glow via-primary to-nebula bg-clip-text text-transparent">
                  {pricingSection.freeAccess}
                </span>
              </p>
              <p className="font-display text-base text-muted-foreground sm:text-xl">
                {pricingSection.freeHeadlineEnd}
              </p>
            </div>

            <Link
              to="/register"
              onClick={() => trackLandingCtaPrimary("pricing")}
              className="group mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-8px_var(--glow)] transition-all hover:scale-[1.02] hover:bg-primary/90 sm:mt-6 sm:w-auto"
            >
              {cta.startFree}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_24px_-8px_var(--glow)]">
            <Tag className="size-5 text-glow" aria-hidden />
          </div>
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {pricingSection.title}
          </h2>
          <p className="mt-3 font-sans text-muted-foreground md:text-lg">
            {pricingSection.subtitle}
          </p>
        </div>

        <PricingCards
          variant="cosmic"
          defaultPlanId="smart"
          onSelectConsumerPlan={(id) => {
            trackLandingPricingPlanClick(id);
            void startCheckout(id, { isLoggedIn });
          }}
          checkoutDisabled={checkoutLoading}
        />
      </div>
    </section>
  );
}
