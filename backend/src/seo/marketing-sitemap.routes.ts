/**
 * Canonical marketing URLs for sitemap Path A (indexable, public).
 * Keep in sync with `frontend/public/sitemap.xml` and `frontend/public/robots.txt`.
 */

export type MarketingSitemapRoute = {
  readonly path: string;
  readonly changefreq: string;
  readonly priority: string;
};

/** Auth and app shells must stay out of this list (noindex + robots Disallow). */
export const MARKETING_SITEMAP_ROUTES: readonly MarketingSitemapRoute[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
] as const;
