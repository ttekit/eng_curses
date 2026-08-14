import React, { Suspense, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { HeroSection } from "../../components/landing/HeroSection";
import { MarketingFaqSection } from "../../components/landing/MarketingFaqSection";
import ContentHeader from "../../components/catalog/ContentHeader";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { buildLandingJsonLdSchemas } from "../../lib/seoStructuredData";
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
const GamificationSection = React.lazy(() =>
  import("../../components/landing/GamificationSection").then((m) => ({
    default: m.GamificationSection,
  })),
);
const LandingPricingSection = React.lazy(() =>
  import("../../components/landing/LandingPricingSection").then((m) => ({
    default: m.LandingPricingSection,
  })),
);
const DifferentiationSection = React.lazy(() =>
  import("../../components/landing/DifferentiationSection").then((m) => ({
    default: m.DifferentiationSection,
  })),
);
const TestimonialsSection = React.lazy(() =>
  import("../../components/landing/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
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
  const { seo, marketingFaq } = messages;
  const location = useLocation();
  const pricingFaqItems = useMemo(
    () => Object.values(messages.pricingQuestions),
    [messages.pricingQuestions],
  );

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
      className="min-h-screen bg-background text-foreground selection:bg-primary/30"
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
        <LandingPricingSection />
        <MarketingFaqSection
          id="pricing-faq"
          title={marketingFaq.pricingTitle}
          subtitle={marketingFaq.pricingSubtitle}
          items={pricingFaqItems}
        />
        <FeaturesSection />
        <DifferentiationSection />
        <HowItWorksSection />
        <GamificationSection />
        <TestimonialsSection />
        <CtaSection />
        <LandingFooter />
      </Suspense>
    </main>
  );
}
