import { cn } from "../../lib/utils";
import type { PricingPlan } from "../../lib/pricingPlans";
import { getSalesContactHref } from "../../lib/salesContact";
import type { PricingCardsProps } from "./PricingCards";

type PricingCtaButtonProps = {
  plan: PricingPlan;
  variant?: "default" | "cosmic";
  onSelectConsumerPlan?: PricingCardsProps["onSelectConsumerPlan"];
  onSelectTeacherPlan?: PricingCardsProps["onSelectTeacherPlan"];
  checkoutDisabled?: boolean;
};

/**
 * Plan call-to-action for pricing cards.
 */
export function PricingCtaButton({
  plan,
  variant = "default",
  onSelectConsumerPlan,
  onSelectTeacherPlan,
  checkoutDisabled,
}: PricingCtaButtonProps) {
  const isCosmic = variant === "cosmic";
  const base = cn(
    "mt-auto w-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    isCosmic ? "rounded-full px-6 py-3.5" : "rounded-xl px-4 py-3",
  );

  if (plan.isContactSales) {
    const outlineClass = cn(
      base,
      "inline-flex items-center justify-center border-2 bg-transparent text-foreground hover:cursor-pointer",
      isCosmic
        ? "border-border/70 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/10"
        : "border-border hover:bg-muted/60",
    );
    if (plan.id === "teacher" && onSelectTeacherPlan) {
      return (
        <button type="button" onClick={onSelectTeacherPlan} className={outlineClass}>
          {plan.ctaLabel}
        </button>
      );
    }
    return (
      <a href={getSalesContactHref()} className={outlineClass}>
        {plan.ctaLabel}
      </a>
    );
  }

  const isPrimary = plan.ctaVariant === "primary";

  return (
    <button
      type="button"
      disabled={checkoutDisabled}
      onClick={() =>
        onSelectConsumerPlan?.(plan.id as "light" | "smart" | "family")
      }
      className={cn(
        base,
        "flex items-center justify-center hover:cursor-pointer",
        isPrimary &&
          (isCosmic
            ? "bg-primary text-primary-foreground shadow-[0_0_30px_-8px_var(--glow)] hover:scale-[1.02] hover:bg-primary/90"
            : "rounded-[15px] bg-primary px-6 py-4 text-foreground/70 hover:bg-purple-hover hover:text-white"),
        !isPrimary &&
          (isCosmic
            ? "border border-border bg-secondary/40 text-foreground backdrop-blur-sm hover:border-primary/30 hover:bg-secondary/70"
            : "rounded-[15px] px-3 py-4 text-foreground/70 hover:bg-muted-foreground/10 hover:text-white"),
      )}
    >
      {plan.ctaLabel}
    </button>
  );
}
