const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";
const QUICK_TRANSLATE_TIMEOUT_MS = 4_000;

export function normalize_translate_word(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

export function normalize_translate_words(words: string[]): string[] {
  return [
    ...new Set(
      words
        .map((word) => normalize_translate_word(word))
        .filter((word) => word.length >= 1 && word.length <= 96),
    ),
  ].slice(0, 30);
}

export function should_translate_to_lang(targetLang?: string | null): string | null {
  const lang = (targetLang ?? "").trim().toLowerCase();
  if (lang.length !== 2 || lang === "en") {
    return null;
  }
  return lang;
}

export async function fetch_mymemory_translation(
  word: string,
  toLang: string,
): Promise<string | null> {
  const normalizedWord = normalize_translate_word(word);
  if (!normalizedWord) {
    return null;
  }
  const query = encodeURIComponent(normalizedWord);
  const response = await fetch(
    `${MYMEMORY_BASE}?q=${query}&langpair=en|${encodeURIComponent(toLang)}`,
    { signal: AbortSignal.timeout(QUICK_TRANSLATE_TIMEOUT_MS) },
  );
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
    matches?: Array<{ translation?: string }>;
  };
  if (payload.responseStatus != null && payload.responseStatus !== 200) {
    return pick_mymemory_translation(payload, normalizedWord);
  }
  return pick_mymemory_translation(payload, normalizedWord);
}

function pick_mymemory_translation(
  payload: {
    responseData?: { translatedText?: string };
    matches?: Array<{ translation?: string }>;
  },
  word: string,
): string | null {
  const primary = payload.responseData?.translatedText?.trim();
  if (primary && !is_same_word(primary, word)) {
    return primary;
  }
  for (const match of payload.matches ?? []) {
    const candidate = match.translation?.trim();
    if (candidate && !is_same_word(candidate, word)) {
      return candidate;
    }
  }
  return null;
}

function is_same_word(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export async function fetch_mymemory_translations(
  words: string[],
  targetLang: string,
): Promise<Record<string, string | null>> {
  const normalized = normalize_translate_words(words);
  const entries = await Promise.all(
    normalized.map(async (word) => {
      const translation = await fetch_mymemory_translation(word, targetLang);
      return [word, translation] as const;
    }),
  );
  return Object.fromEntries(entries);
}
