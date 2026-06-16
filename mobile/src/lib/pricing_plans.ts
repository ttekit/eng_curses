export type PricingPlanId = "light" | "smart" | "family" | "teacher";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  description: string;
  priceLabel: string;
  billingNote?: string;
  features: readonly string[];
  ctaLabel: string;
  isPopular?: boolean;
  isContactSales?: boolean;
};

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "light",
    name: "Light",
    description: "Self-paced essentials.",
    priceLabel: "$7",
    billingNote: "per month",
    features: [
      "Full video library",
      "Basic quests and gamification",
      "Personal dictionary",
    ],
    ctaLabel: "Select Light",
  },
  {
    id: "smart",
    name: "Smart",
    description: "Adaptive AI program.",
    priceLabel: "$12",
    billingNote: "per month",
    features: [
      "AI error analysis",
      "Unlimited exercises",
      "Progress analytics",
      "Personalized growth plan",
    ],
    ctaLabel: "Start with Smart",
    isPopular: true,
  },
  {
    id: "family",
    name: "Family",
    description: "Smart plan for the whole family.",
    priceLabel: "$19",
    billingNote: "per month",
    features: ["Up to 3 profiles", "Parental controls", "Family tournaments"],
    ctaLabel: "Sign up for Family",
  },
  {
    id: "teacher",
    name: "Teacher",
    description: "Classroom tools for educators.",
    priceLabel: "Custom",
    billingNote: "Enterprise",
    features: ["Teacher dashboard", "Automated quiz checking", "Student analytics"],
    ctaLabel: "Contact sales",
    isContactSales: true,
  },
] as const;

export function build_pricing_checkout_url(planId: PricingPlanId): string {
  return `https://explys.com/pricing?plan=${planId}`;
}
