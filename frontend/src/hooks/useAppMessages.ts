import { useLandingLocale } from "../context/LandingLocaleContext";
import { appEn } from "../locales/app/en";
import { appUk } from "../locales/app/uk";

/**
 * Returns app-scoped UI messages for the active landing locale (en / uk).
 */
export function useAppMessages(): typeof appEn {
  const { locale } = useLandingLocale();
  return locale === "uk" ? appUk : appEn;
}
