export type PhraseToken = {
  word: string;
  position: number;
  isProperNoun: boolean;
};

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "its",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "this",
  "that",
  "with",
  "as",
  "by",
  "from",
  "not",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "will",
  "would",
  "can",
  "could",
  "should",
  "so",
  "if",
  "just",
  "like",
  "what",
  "when",
  "where",
  "who",
  "how",
  "all",
  "there",
  "here",
  "up",
  "out",
  "about",
  "into",
  "over",
  "after",
  "before",
  "then",
  "than",
  "too",
  "very",
  "no",
  "yes",
  "oh",
  "um",
  "uh",
]);

function is_proper_noun_surface(
  raw: string,
  phrase: string,
  startIndex: number,
): boolean {
  if (!/^\p{Lu}/u.test(raw)) {
    return false;
  }
  const prefix = phrase.slice(0, startIndex).trimEnd();
  if (prefix.length === 0) {
    return false;
  }
  return !/[.!?]["']?\s*$/u.test(prefix);
}

/** Tokenizes a subtitle phrase into lemma candidates. */
export function tokenize_phrase(
  phrase: string,
  options?: { includeStopwords?: boolean },
): PhraseToken[] {
  const includeStopwords = options?.includeStopwords ?? false;
  const pattern = /[\p{L}\p{N}'-]+/gu;
  const tokens: PhraseToken[] = [];
  let position = 0;
  for (const match of phrase.matchAll(pattern)) {
    const raw = match[0];
    const startIndex = match.index ?? 0;
    const word = raw.toLowerCase().replace(/^['-]+|['-]+$/g, "");
    if (word.length < 2 || word.length > 48) {
      continue;
    }
    if (!includeStopwords && STOPWORDS.has(word)) {
      continue;
    }
    tokens.push({
      word,
      position,
      isProperNoun: is_proper_noun_surface(raw, phrase, startIndex),
    });
    position += 1;
  }
  return tokens;
}

/** Infers CEFR band from phrase complexity when video tags are absent. */
export function infer_difficulty_from_phrase(phrase: string): string {
  const words = phrase.split(/\s+/).filter(Boolean);
  const avgWordLen =
    words.reduce((sum, word) => sum + word.length, 0) /
    Math.max(words.length, 1);
  if (words.length <= 6 && avgWordLen <= 5) {
    return "A1";
  }
  if (words.length <= 10 && avgWordLen <= 6) {
    return "A2";
  }
  if (words.length <= 14) {
    return "B1";
  }
  return "B2";
}
