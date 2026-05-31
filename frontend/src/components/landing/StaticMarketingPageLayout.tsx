import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import ContentHeader from "../catalog/ContentHeader";
import { SEO } from "../SEO/SEO";
import { LandingFooter } from "./LandingFooter";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { buildMarketingHreflangAlternates } from "../../lib/seoHreflang";
import { resolveCanonicalUrl } from "../../lib/siteUrl";

type StaticMarketingPageLayoutProps = {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly children: ReactNode;
};

/**
 * Shared shell for public marketing and legal pages: header, SEO, footer.
 */
export function StaticMarketingPageLayout({
  title,
  description,
  path,
  children,
}: StaticMarketingPageLayoutProps) {
  const { locale } = useLandingLocale();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background font-display text-foreground antialiased">
      <SEO
        title={title}
        description={description}
        canonicalUrl={resolveCanonicalUrl(path)}
        ogLocale={locale === "uk" ? "uk_UA" : "en_US"}
        ogLocaleAlternate={locale === "uk" ? "en_US" : "uk_UA"}
        hreflangAlternates={buildMarketingHreflangAlternates(path)}
      />
      <ContentHeader variant="landing" />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
