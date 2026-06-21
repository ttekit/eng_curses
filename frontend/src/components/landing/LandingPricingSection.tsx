import { Link } from "react-router";
import PricingCards from "../pricing/PricingCards";
import { useUser } from "../../context/UserContext";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { ArrowRight } from "lucide-react";
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
      className="relative border-t border-border bg-background px-4 py-16 font-display sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="font-sans text-lg font-semibold text-foreground md:text-xl">
            {pricingSection.freeHeadline}
          </p>
          <p className="mt-2 font-sans text-sm text-muted-foreground">
            {pricingSection.freePromo}
          </p>
          <Link
            to="/registrationMain"
            onClick={() => trackLandingCtaPrimary("pricing")}
            className="mt-4 inline-flex cursor-pointer flex-row items-center justify-center rounded-md p-2 text-primary transition-all duration-300 hover:bg-primary/20"
          >
            <span>{cta.startFree}</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {pricingSection.title}
          </h2>
          <p className="mt-3 font-sans text-muted-foreground md:text-lg">
            {pricingSection.subtitle}
          </p>
          <Link
            to="/pricing"
            className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {pricingSection.fullPageLink}
          </Link>
        </div>

        <PricingCards
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
