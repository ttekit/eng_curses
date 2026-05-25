import { getSiteUrl } from "./siteUrl";

/** Default Open Graph share image (1200×630 PNG in `public/og-image.png`). */
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

/** Optional Twitter @site handle from `VITE_TWITTER_SITE` (e.g. `@explys`). */
export function getTwitterSiteHandle(): string | undefined {
  const raw = import.meta.env.VITE_TWITTER_SITE?.trim();
  if (!raw) return undefined;
  return raw.startsWith("@") ? raw : `@${raw}`;
}

/** Absolute URL for the default OG image. */
export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}${DEFAULT_OG_IMAGE_PATH}`;
}
