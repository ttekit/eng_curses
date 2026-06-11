import React, { Suspense, useEffect } from "react";
import { useLocation } from "react-router"; // Додали хук для відслідковування URL
import { HeroSection } from "../../components/landing/HeroSection";
import { MarketingFaqSection } from "../../components/landing/MarketingFaqSection";
import ContentHeader from "../../components/catalog/ContentHeader";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { buildLandingJsonLdSchemas } from "../../lib/seoStructuredData";
import { landingFaqEn } from "../../lib/marketingSeoContent";
import { buildMarketingHreflangAlternates } from "../../lib/seoHreflang";
import { useLandingLocale } from "../../context/LandingLocaleContext";

const FeaturesSection = React.lazy(() =>
  import("../../components/landing/FeaturesSection").then((m) => ({
    default: m.FeaturesSection,
  })),
);
const HowItWorksSection = React.lazy(() =>
  import("../../components/landing/HowItWorksSection").then((m) => ({
    default: m.HowItWorksSection,
  })),
);
const LandingPricingSection = React.lazy(() =>
  import("../../components/landing/LandingPricingSection").then((m) => ({
    default: m.LandingPricingSection,
  })),
);
const CtaSection = React.lazy(() =>
  import("../../components/landing/CtaSection").then((m) => ({
    default: m.CtaSection,
  })),
);
const LandingFooter = React.lazy(() =>
  import("../../components/landing/LandingFooter").then((m) => ({
    default: m.LandingFooter,
  })),
);

export default function LandingPage() {
  const { messages, locale } = useLandingLocale();
  const { seo } = messages;
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);

      const scrollToElement = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      };

      const timeoutId = setTimeout(scrollToElement, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [location.hash]);

  return (
    <main
      className=" min-h-screen bg-background text-foreground selection:bg-primary/30"
      lang={locale === "uk" ? "uk" : "en"}
    >
      <SEO
        title={seo.title}
        description={seo.description}
        canonicalUrl={resolveCanonicalUrl("/")}
        useTitleSuffix={false}
        ogLocale={locale === "uk" ? "uk_UA" : "en_US"}
        ogLocaleAlternate={locale === "uk" ? "en_US" : "uk_UA"}
        hreflangAlternates={buildMarketingHreflangAlternates("/")}
        jsonLd={buildLandingJsonLdSchemas()}
      />
      <ContentHeader variant="landing" />
      <HeroSection />

      <Suspense fallback={<div className="min-h-screen" />}>
        <FeaturesSection />
        <HowItWorksSection />
        <LandingPricingSection />
        <MarketingFaqSection
          id="faq"
          title={messages.marketingFaq.landingTitle}
          subtitle={messages.marketingFaq.landingSubtitle}
          items={landingFaqEn}
        />
        <CtaSection />
        <LandingFooter />
      </Suspense>
    </main>
  );
}
