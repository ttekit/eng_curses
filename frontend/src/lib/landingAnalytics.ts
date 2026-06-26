import { captureEvent } from "./analytics";

export function trackLandingCtaPrimary(source: "hero" | "bottom" | "pricing"): void {
  captureEvent("landing_cta_primary_click", { source });
}

export function trackLandingCtaSecondary(source: "hero" | "bottom"): void {
  captureEvent("landing_cta_secondary_click", { source });
}

export function trackLandingHeroVideoPlay(): void {
  captureEvent("landing_hero_video_play");
}

export function trackLandingPricingPlanClick(
  planId: string,
): void {
  captureEvent("landing_pricing_plan_click", { planId });
}
