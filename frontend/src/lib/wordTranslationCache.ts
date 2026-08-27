function normalize_cache_word(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function cache_key(word: string, targetLang: string | undefined): string {
  return `${targetLang ?? "en"}:${normalize_cache_word(word)}`;
}

const translation_cache = new Map<string, string>();

export function get_cached_translation(
  word: string,
  targetLang: string | undefined,
): string | null {
  return translation_cache.get(cache_key(word, targetLang)) ?? null;
}

export function set_cached_translation(
  word: string,
  targetLang: string | undefined,
  translation: string,
): void {
  const normalized = translation.trim();
  if (!normalized) {
    return;
  }
  translation_cache.set(cache_key(word, targetLang), normalized);
}

export function set_cached_translations(
  entries: Record<string, string | null>,
  targetLang: string | undefined,
): void {
  for (const [word, translation] of Object.entries(entries)) {
    if (translation?.trim()) {
      set_cached_translation(word, targetLang, translation);
    }
  }
}

export function list_missing_translations(
  words: string[],
  targetLang: string | undefined,
): string[] {
  return [
    ...new Set(
      words
        .map((word) => normalize_cache_word(word))
        .filter((word) => word.length >= 1 && !get_cached_translation(word, targetLang)),
    ),
  ];
}
