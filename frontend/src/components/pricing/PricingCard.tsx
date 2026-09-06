import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PricingPlan } from "../../lib/pricingPlans";
import type { PricingCardsProps } from "./PricingCards";
import { PricingCtaButton } from "./PricingCtaButton";

export type PricingCardVariant = "default" | "cosmic";

type PricingCardProps = {
  plan: PricingPlan;
  popularBadge: string;
  teacherPriceTitle: string;
  variant?: PricingCardVariant;
  layout?: "grid" | "carousel";
  isDefaultSelected?: boolean;
  onSelectConsumerPlan?: PricingCardsProps["onSelectConsumerPlan"];
  onSelectTeacherPlan?: PricingCardsProps["onSelectTeacherPlan"];
  checkoutDisabled?: boolean;
};

/**
 * Single pricing tier card with optional cosmic landing styling.
 */
export function PricingCard({
  plan,
  popularBadge,
  teacherPriceTitle,
  variant = "default",
  layout = "grid",
  isDefaultSelected = false,
  onSelectConsumerPlan,
  onSelectTeacherPlan,
  checkoutDisabled,
}: PricingCardProps) {
  const isCosmic = variant === "cosmic";
  const popular = plan.isPopular === true || isDefaultSelected;

  return (
    <div
      data-plan-id={plan.id}
      className={cn(
        "group relative flex h-full flex-col",
        layout === "carousel" &&
          "w-[min(85vw,320px)] shrink-0 snap-center md:w-auto md:shrink",
        isCosmic
          ? cn(
              "overflow-hidden rounded-3xl border bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1",
              popular
                ? "z-10 border-primary/50 shadow-[0_24px_60px_-28px_var(--glow)] xl:scale-[1.02]"
                : "border-border/70 hover:border-primary/30 hover:shadow-[0_20px_50px_-28px_var(--glow)]",
            )
          : cn(
              "rounded-2xl border bg-card p-6 shadow-sm",
              popular
                ? "z-10 border-primary/60 bg-linear-to-b from-primary/10 via-card to-card shadow-[0_0_0_1px_oklch(0.65_0.25_295/0.35)] lg:scale-[1.02]"
                : "border-border",
            ),
      )}
    >
      {isCosmic && popular ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 animate-aurora rounded-full bg-primary/20 blur-3xl"
        />
      ) : null}

      {popular ? (
        <div className="relative z-20 mb-4 flex justify-center">
          <span
            className={cn(
              "rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground",
              isCosmic ? "shadow-[0_0_20px_-4px_var(--glow)]" : "shadow-md",
            )}
          >
            {popularBadge}
          </span>
        </div>
      ) : null}

      <div className={cn("relative mb-4", !popular && "pt-1")}>
        <h3 className="font-display text-lg font-semibold text-foreground">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
      </div>

      <div className="relative mb-6 border-b border-border/70 pb-6">
        {plan.isContactSales ? (
          <div>
            <p className="font-display text-3xl font-bold tracking-tight text-foreground">
              {teacherPriceTitle}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{plan.billingNote}</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
            <span
              className={cn(
                "font-display text-4xl font-bold tracking-tight",
                isCosmic && popular
                  ? "animate-gradient-text bg-gradient-to-r from-glow via-primary to-nebula bg-clip-text text-transparent"
                  : "text-foreground",
              )}
            >
              {plan.priceLabel}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {plan.billingNote}
            </span>
          </div>
        )}
      </div>

      <ul className="relative mb-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature, index) => (
          <li
            key={`${plan.id}-${index}`}
            className="flex gap-3 text-sm text-foreground/90"
          >
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                isCosmic ? "text-glow" : "text-emerald-500",
              )}
              strokeWidth={2.5}
              aria-hidden
            />
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      <PricingCtaButton
        plan={plan}
        variant={variant}
        onSelectConsumerPlan={onSelectConsumerPlan}
        onSelectTeacherPlan={onSelectTeacherPlan}
        checkoutDisabled={checkoutDisabled}
      />
    </div>
  );
}
