import snapshot from "./marketing-seo.snapshot.json";

export type MarketingFaqItem = {
  question: string;
  answer: string;
};

export type SubscriptionProductSnapshot = {
  id: string;
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
};

export const landingFaqEn: MarketingFaqItem[] = snapshot.landingFaq;
export const pricingFaqEn: MarketingFaqItem[] = snapshot.pricingFaq;
export const subscriptionProductsEn: SubscriptionProductSnapshot[] =
  snapshot.subscriptionProducts;
