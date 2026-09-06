/**
 * Map profile `nativeLanguage` (often a full name) to ISO 639-1 for translation APIs.
 */
export function nativeLanguageToIso639_1(native: string | undefined): string | undefined {
  if (!native?.trim()) return undefined;
  const n = native.trim().toLowerCase();

  const map: Record<string, string> = {
    ukrainian: "uk",
    "українська": "uk",
    uk: "uk",
    ukr: "uk",
    russian: "ru",
    російська: "ru",
    rus: "ru",
    ru: "ru",
    polish: "pl",
    polski: "pl",
    pl: "pl",
    german: "de",
    deutsch: "de",
    de: "de",
    french: "fr",
    français: "fr",
    fr: "fr",
    spanish: "es",
    español: "es",
    es: "es",
    italian: "it",
    italiano: "it",
    it: "it",
    portuguese: "pt",
    pt: "pt",
    chinese: "zh",
    zh: "zh",
    japanese: "ja",
    ja: "ja",
    korean: "ko",
    ko: "ko",
    arabic: "ar",
    ar: "ar",
    turkish: "tr",
    tr: "tr",
    dutch: "nl",
    nl: "nl",
    swedish: "sv",
    sv: "sv",
    czech: "cs",
    cs: "cs",
    romanian: "ro",
    ro: "ro",
    hungarian: "hu",
    hu: "hu",
    greek: "el",
    el: "el",
    hebrew: "he",
    he: "he",
    hindi: "hi",
    hi: "hi",
    english: "en",
    en: "en",
  };

  if (map[n]) {
    return map[n];
  }

  if (/^[a-z]{2}$/i.test(n)) {
    return n.toLowerCase();
  }
  return undefined;
}

/**
 * Resolve the best ISO 639-1 code for word translation APIs.
 */
export function resolve_translation_target_lang(
  nativeLanguage: string | undefined,
  uiLocale?: string,
): string {
  const fromNative = nativeLanguageToIso639_1(nativeLanguage);
  if (fromNative && fromNative !== "en") {
    return fromNative;
  }
  const fromUi = nativeLanguageToIso639_1(uiLocale);
  if (fromUi && fromUi !== "en") {
    return fromUi;
  }
  return "uk";
}
