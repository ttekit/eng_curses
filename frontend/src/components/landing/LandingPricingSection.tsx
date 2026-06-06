import { Link } from "react-router";
import PricingCards from "../pricing/PricingCards";
import { useUser } from "../../context/UserContext";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { ArrowRight } from "lucide-react";

/**
 * Pricing grid for the marketing home page (same plans as /pricing).
 */
export function LandingPricingSection() {
  const { isLoggedIn } = useUser();
  const { startCheckout, checkoutLoading } = usePricingCheckout();
  const { messages } = useLandingLocale();
  const { pricingSection } = messages;

  return (
    <section
      id="pricing"
      className="relative border-border border-t bg-background px-4 py-16 font-display sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="relative sm:absolute inset-0 z-10 text-center flex flex-col mt-2 sm:justify-center items-center">
        <div className="relative flex justify-center items-center mb-5 w-50 h-50">
          <div className="absolute w-40 h-40 rounded-full bg-linear-to-tr from-primary to-accent opacity-40 blur-2xl animate-pulse" />
          <img
            src="./ResultHappy.svg"
            className="relative z-10 w-full h-full"
            alt="Happy icon"
          />
        </div>
        <p className="text-4xl font-bold text-foreground mb-1">
          {pricingSection.freeAccess}
        </p>
        <Link
          to="/registrationMain"
          className="hover:cursor-pointer inline-flex flex-row items-center text-center justify-center text-primary m-2 hover:bg-primary/20 rounded-md p-2 transition-all duration-300"
        >
          <span>{pricingSection.startLearning}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="hidden sm:block relative mx-auto max-w-7xl opacity-20 pointer-events-none cursor-not-allowed select-none blur-[1px]">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {pricingSection.title}
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
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
          onSelectConsumerPlan={(id) => void startCheckout(id, { isLoggedIn })}
          checkoutDisabled={checkoutLoading}
        />
      </div>
    </section>
  );
}
