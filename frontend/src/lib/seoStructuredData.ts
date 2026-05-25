import { getSiteUrl } from "./siteUrl";
import type { LandingLocaleId } from "../locales/landing";
import { landingEn } from "../locales/landing/en";
import { landingUk } from "../locales/landing/uk";

/** Organization + WebSite JSON-LD for the marketing site (no server required). */
export function buildExplysOrganizationJsonLd(origin: string) {
  const logo = `${origin}/Icon.svg`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Explys",
    url: origin,
    logo,
    description:
      "Personalized English learning through adaptive video lessons, quizzes, and AI-assisted practice.",
  };
}

export function buildExplysWebSiteJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Explys",
    url: origin,
    description:
      "Learn English your way with adaptive video content and interactive lessons.",
    publisher: {
      "@type": "Organization",
      name: "Explys",
      url: origin,
      logo: `${origin}/Icon.svg`,
    },
  };
}

export function buildLandingJsonLdSchemas() {
  const origin = getSiteUrl();
  return [
    buildExplysOrganizationJsonLd(origin),
    buildExplysWebSiteJsonLd(origin),
  ];
}

type PricingPlanId = "light" | "smart" | "family" | "teacher";

function getPricingMessages(locale: LandingLocaleId) {
  return locale === "uk" ? landingUk : landingEn;
}

/** OfferCatalog JSON-LD for the public pricing page. */
export function buildPricingJsonLdSchemas(locale: LandingLocaleId = "en") {
  const origin = getSiteUrl();
  const cards = getPricingMessages(locale).pricingCards.plans;
  const planOrder: PricingPlanId[] = ["light", "smart", "family", "teacher"];

  const offers = planOrder.map((planId) => {
    const plan = cards[planId];
    return {
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      url: `${origin}/pricing`,
      category: planId === "teacher" ? "Enterprise" : "Subscription",
    };
  });

  return [
    buildExplysOrganizationJsonLd(origin),
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: getPricingMessages(locale).pricingPage.title,
      description: getPricingMessages(locale).pricingPage.description,
      url: `${origin}/pricing`,
      itemListElement: offers,
    },
  ];
}

export type VideoJsonLdInput = {
  id: number | string;
  videoName: string;
  videoDescription?: string | null;
  thumbnailUrl?: string | null;
  videoLink?: string | null;
};

/** VideoObject + LearningResource JSON-LD for public lesson pages (Path B). */
export function buildLessonVideoJsonLd(input: VideoJsonLdInput) {
  const origin = getSiteUrl();
  const pageUrl = `${origin}/content/${input.id}`;
  const thumbnail =
    input.thumbnailUrl?.trim() ?
      input.thumbnailUrl.startsWith("http") ?
        input.thumbnailUrl
      : `${origin}${input.thumbnailUrl.startsWith("/") ? "" : "/"}${input.thumbnailUrl}`
    : `${origin}/og-image.png`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: input.videoName,
      description: input.videoDescription?.trim() || input.videoName,
      thumbnailUrl: thumbnail,
      contentUrl: input.videoLink?.trim() || pageUrl,
      embedUrl: pageUrl,
      uploadDate: new Date().toISOString().slice(0, 10),
      inLanguage: "en",
      isPartOf: {
        "@type": "WebSite",
        name: "Explys",
        url: origin,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: input.videoName,
      description: input.videoDescription?.trim() || input.videoName,
      url: pageUrl,
      learningResourceType: "Video lesson",
      inLanguage: "en",
    },
  ];
}

export type SeriesJsonLdInput = {
  friendlyLink: string;
  name: string;
  description?: string | null;
};

/** Course / ItemList JSON-LD for a public catalog series (Path B). */
export function buildSeriesCourseJsonLd(input: SeriesJsonLdInput) {
  const origin = getSiteUrl();
  const pageUrl = `${origin}/catalog/series/${encodeURIComponent(input.friendlyLink)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description?.trim() || input.name,
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "Explys",
      url: origin,
    },
    inLanguage: "en",
  };
}

export type BreadcrumbItem = {
  name: string;
  path: string;
};

/** BreadcrumbList JSON-LD for series → lesson navigation. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}
