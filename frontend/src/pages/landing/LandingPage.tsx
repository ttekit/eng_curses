import { HeroSection } from "../../components/landing/HeroSection";
import { FeaturesSection } from "../../components/landing/FeaturesSection";
import { HowItWorksSection } from "../../components/landing/HowItWorksSection";
import { CtaSection } from "../../components/landing/CtaSection";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { LandingPricingSection } from "../../components/landing/LandingPricingSection";
import ContentHeader from "../../components/catalog/ContentHeader";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { buildLandingJsonLdSchemas } from "../../lib/seoStructuredData";
import { buildMarketingHreflangAlternates } from "../../lib/seoHreflang";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function LandingPage() {
  const { messages, locale } = useLandingLocale();
  const { seo } = messages;

  return (
    <main
      className="min-h-screen"
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
      <FeaturesSection />
      <HowItWorksSection />
      <LandingPricingSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
