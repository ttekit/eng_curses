import { useCallback, useRef, useState } from "react";
import {
  fetchQuickTranslations,
  fetchVocabularyHints,
  type VocabularyHint,
} from "../../lib/srsApi";
import { resolve_translation_target_lang } from "../../lib/nativeLanguageCode";
import {
  get_cached_translation,
  list_missing_translations,
  set_cached_translation,
  set_cached_translations,
} from "../../lib/wordTranslationCache";

export type WordHintStatus = "idle" | "loading" | "ready" | "error";

function normalize_word(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function to_hint(translation: string): VocabularyHint {
  return {
    translation,
    pronunciation: null,
    meaning: null,
  };
}

export function useWordHint(
  nativeLanguage: string | undefined,
  uiLocale?: string,
) {
  const [hint, setHint] = useState<VocabularyHint | null>(null);
  const [hintStatus, setHintStatus] = useState<WordHintStatus>("idle");
  const requestIdRef = useRef(0);
  const targetLang = resolve_translation_target_lang(nativeLanguage, uiLocale);

  const resetHint = useCallback(() => {
    requestIdRef.current += 1;
    setHint(null);
    setHintStatus("idle");
  }, []);

  const fetch_single_translation = useCallback(
    async (word: string): Promise<string | null> => {
      const cached = get_cached_translation(word, targetLang);
      if (cached) {
        return cached;
      }
      const quick = await fetchQuickTranslations([word], targetLang);
      set_cached_translations(quick, targetLang);
      const fromQuick = quick[word]?.trim() ?? null;
      if (fromQuick) {
        return fromQuick;
      }
      const hints = await fetchVocabularyHints([word], targetLang);
      const fromHints = hints[word]?.translation?.trim() ?? null;
      if (fromHints) {
        set_cached_translation(word, targetLang, fromHints);
      }
      return fromHints;
    },
    [targetLang],
  );

  const resolveTranslations = useCallback(
    async (words: string[]): Promise<void> => {
      const normalized = words.map(normalize_word).filter(Boolean);
      const missing = list_missing_translations(normalized, targetLang);
      if (missing.length === 0) {
        return;
      }
      const quick = await fetchQuickTranslations(missing, targetLang);
      set_cached_translations(quick, targetLang);
      const stillMissing = list_missing_translations(missing, targetLang);
      if (stillMissing.length === 0) {
        return;
      }
      await Promise.all(
        stillMissing.map(async (word) => {
          await fetch_single_translation(word);
        }),
      );
    },
    [fetch_single_translation, targetLang],
  );

  const prefetchWords = useCallback(
    async (words: string[]) => {
      try {
        await resolveTranslations(words);
      } catch {
        // Prefetch is best-effort.
      }
    },
    [resolveTranslations],
  );

  const loadHint = useCallback(
    async (input: { word: string }) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const normalizedWord = normalize_word(input.word);
      if (!normalizedWord) {
        setHint(null);
        setHintStatus("ready");
        return;
      }
      const cached = get_cached_translation(normalizedWord, targetLang);
      if (cached) {
        setHint(to_hint(cached));
        setHintStatus("ready");
        return;
      }
      setHint(null);
      setHintStatus("loading");
      try {
        const translation = await fetch_single_translation(normalizedWord);
        if (requestId !== requestIdRef.current) {
          return;
        }
        setHint(translation ? to_hint(translation) : null);
        setHintStatus("ready");
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setHint(null);
        setHintStatus("error");
      }
    },
    [fetch_single_translation, targetLang],
  );

  return { hint, hintStatus, loadHint, prefetchWords, resetHint };
}
