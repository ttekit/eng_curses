import type { HreflangAlternate } from "../components/SEO/SEO";
import { getSiteUrl } from "./siteUrl";

/**
 * Builds hreflang alternates for marketing pages using `?lang=uk` query param.
 *
 * @param path - Route path without query, e.g. `/` or `/pricing`.
 */
export function buildMarketingHreflangAlternates(path: string): HreflangAlternate[] {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const ukHref = normalized === "/" ? "/?lang=uk" : `${normalized}?lang=uk`;
  return [
    { hreflang: "en", href: normalized },
    { hreflang: "uk", href: ukHref },
    { hreflang: "x-default", href: normalized },
  ];
}

/** Origin used in JSON-LD and sitemap helpers. */
export function getSeoOrigin(): string {
  return getSiteUrl();
}
