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
 * Backup of the original landing pricing section layout.
 */
export function LandingPricingSectionBackup() {
  const { isLoggedIn } = useUser();
  const { startCheckout, checkoutLoading } = usePricingCheckout();
  const { messages } = useLandingLocale();
  const { pricingSection, cta } = messages;

  return (
    <section
      id="pricing"
      className="relative border-t border-border/60 bg-background/50 px-4 py-16 font-display backdrop-blur-[2px] sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="w-full">
            <div className="flex w-full flex-row justify-center gap-2">
              <p className="font-display text-xl font-semibold text-foreground md:text-3xl">
                {pricingSection.freeHeadline}
              </p>
              <p className="font-display text-xl font-bold text-primary md:text-3xl">
                {pricingSection.freeAccess}
              </p>
            </div>
            <p className="font-display text-xl font-semibold text-foreground md:text-3xl">
              {pricingSection.freeHeadlineEnd}
            </p>
          </div>
          <Link
            to="/register"
            onClick={() => trackLandingCtaPrimary("pricing")}
            className="mt-4 inline-flex cursor-pointer flex-row items-center justify-center rounded-[15px] p-2 px-3 text-primary transition-all duration-300 hover:bg-primary/20"
          >
            <span>{cta.startFree}</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto -mt-3 mb-12 max-w-2xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {pricingSection.title}
          </h2>
          <p className="mt-3 font-sans text-muted-foreground md:text-lg">
            {pricingSection.subtitle}
          </p>
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
