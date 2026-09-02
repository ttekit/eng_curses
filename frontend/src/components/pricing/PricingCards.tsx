import { useEffect, useMemo, useRef } from "react";
import { cn } from "../../lib/utils";
import {
  type PricingPlan,
  type PricingPlanId,
  PRICING_PLANS,
} from "../../lib/pricingPlans";
import type { LandingMessages } from "../../locales/landing";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useIsMdUp } from "../../hooks/useMediaQuery";
import { PricingCard, type PricingCardVariant } from "./PricingCard";

const DEFAULT_PLAN_ID: PricingPlanId = "smart";

export type PricingCardsProps = {
  onSelectConsumerPlan?: (
    planId: Extract<PricingPlanId, "light" | "smart" | "family">,
  ) => void;
  onSelectTeacherPlan?: () => void;
  checkoutDisabled?: boolean;
  className?: string;
  onlyPlanId?: string;
  variant?: PricingCardVariant;
  defaultPlanId?: PricingPlanId;
};

function overlayPlan(
  base: PricingPlan,
  pc: LandingMessages["pricingCards"],
): PricingPlan {
  const overlay = pc.plans[base.id];
  return {
    ...base,
    name: overlay.name,
    description: overlay.description,
    billingNote: overlay.billingNote,
    features: overlay.features.map((text) => ({ text })),
    ctaLabel: overlay.ctaLabel,
  };
}

function centerCarouselOnPlan(
  container: HTMLDivElement,
  planId: PricingPlanId,
): void {
  const defaultCard = container.querySelector(`[data-plan-id="${planId}"]`);
  if (!(defaultCard instanceof HTMLElement)) {
    return;
  }
  const cardLeft = defaultCard.offsetLeft;
  const cardWidth = defaultCard.offsetWidth;
  const containerWidth = container.offsetWidth;
  container.scrollLeft = cardLeft - (containerWidth - cardWidth) / 2;
}

export default function PricingCards({
  onSelectConsumerPlan,
  onSelectTeacherPlan,
  checkoutDisabled = false,
  className,
  onlyPlanId,
  variant = "default",
  defaultPlanId = DEFAULT_PLAN_ID,
}: PricingCardsProps) {
  const { messages } = useLandingLocale();
  const pc = messages.pricingCards;
  const isMdUp = useIsMdUp();
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const plans = useMemo(() => {
    let basePlans = PRICING_PLANS.map((plan) => overlayPlan(plan, pc));
    if (onlyPlanId) {
      basePlans = basePlans.filter((plan) => plan.id === onlyPlanId);
    }
    return basePlans;
  }, [pc, onlyPlanId]);

  useEffect(() => {
    if (onlyPlanId || isMdUp || !mobileCarouselRef.current) {
      return;
    }
    centerCarouselOnPlan(mobileCarouselRef.current, defaultPlanId);
  }, [defaultPlanId, isMdUp, onlyPlanId, plans]);

  const sharedCardProps = {
    variant,
    popularBadge: pc.popularBadge,
    teacherPriceTitle: pc.teacherPriceTitle,
    onSelectConsumerPlan,
    onSelectTeacherPlan,
    checkoutDisabled,
  };

  if (onlyPlanId) {
    return (
      <div className={cn("mx-auto max-w-md", className)}>
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            layout="grid"
            isDefaultSelected={plan.id === defaultPlanId}
            {...sharedCardProps}
          />
        ))}
      </div>
    );
  }

  if (isMdUp) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-6 overflow-hidden xl:grid-cols-4 xl:items-stretch xl:gap-5",
          className,
        )}
      >
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            layout="grid"
            isDefaultSelected={plan.id === defaultPlanId}
            {...sharedCardProps}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={mobileCarouselRef}
      className={cn(
        "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-4 px-4",
        className,
      )}
    >
      {plans.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          layout="carousel"
          isDefaultSelected={plan.id === defaultPlanId}
          {...sharedCardProps}
        />
      ))}
    </div>
  );
}
