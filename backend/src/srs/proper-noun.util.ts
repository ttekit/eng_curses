import { tokenize_phrase } from "./tokenize-phrase.util";

export function list_proper_noun_words(fullPhrase: string): Set<string> {
  return new Set(
    tokenize_phrase(fullPhrase)
      .filter((token) => token.isProperNoun)
      .map((token) => token.word),
  );
}

export function filter_learnable_words(
  segmentWords: readonly string[],
  fullPhrase: string,
): string[] {
  const properNouns = list_proper_noun_words(fullPhrase);
  return segmentWords.filter((word) => !properNouns.has(word));
}
