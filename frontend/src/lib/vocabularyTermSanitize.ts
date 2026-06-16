/**
 * Learner-facing vocabulary cleanup: drop names and normalize to usual dictionary forms.
 */

const ALLOWED_TITLE_CASE = new Set([
  "English",
  "American",
  "British",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]);

const SINGLE_TOKEN_HEADWORDS: Record<string, string> = {
  "i'm": "be",
  "you're": "be",
  "he's": "be",
  "she's": "be",
  "it's": "be",
  "we're": "be",
  "they're": "be",
  "i've": "have",
  "you've": "have",
  "we've": "have",
  "they've": "have",
  "i'd": "would",
  "you'd": "would",
  "he'd": "would",
  "she'd": "would",
  "we'd": "would",
  "they'd": "would",
  "i'll": "will",
  "you'll": "will",
  "he'll": "will",
  "she'll": "will",
  "we'll": "will",
  "they'll": "will",
  "don't": "do",
  "doesn't": "do",
  "didn't": "do",
  "won't": "will",
  "can't": "can",
  "couldn't": "can",
  "shouldn't": "should",
  "wouldn't": "would",
  "isn't": "be",
  "aren't": "be",
  "wasn't": "be",
  "weren't": "be",
  "haven't": "have",
  "hasn't": "have",
  "hadn't": "have",
};

const IRREGULAR_LEMMAS: Record<string, string> = {
  am: "be",
  is: "be",
  are: "be",
  was: "be",
  were: "be",
  been: "be",
  being: "be",
  has: "have",
  had: "have",
  having: "have",
  does: "do",
  did: "do",
  doing: "do",
  went: "go",
  gone: "go",
  going: "go",
  children: "child",
  brothers: "brother",
  sisters: "sister",
};

function normalizeApostrophes(raw: string): string {
  return raw.replace(/[\u2019`´]/g, "'");
}

function isProbableProperNoun(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed) return true;
  if (/\s/.test(trimmed)) {
    const parts = trimmed.split(/\s+/).filter((p) => p.length > 0);
    if (
      parts.length >= 2 &&
      parts.every((part) => /^[A-Z][a-z]+$/.test(part))
    ) {
      return true;
    }
    return false;
  }
  if (/^[A-Z]{2,}$/.test(trimmed) && !["OK", "TV", "AM", "PM"].includes(trimmed)) {
    return true;
  }
  if (/^[A-Z][a-z]+$/.test(trimmed) && !ALLOWED_TITLE_CASE.has(trimmed)) {
    return true;
  }
  return false;
}

function lemmatizeToken(token: string): string {
  let low = normalizeApostrophes(token).toLowerCase();
  const headword = SINGLE_TOKEN_HEADWORDS[low];
  if (headword) return headword;
  if (IRREGULAR_LEMMAS[low]) return IRREGULAR_LEMMAS[low];
  if (low.endsWith("'s") && low.length > 3) low = low.slice(0, -2);
  if (low.endsWith("ies") && low.length > 4) return `${low.slice(0, -3)}y`;
  if (low.endsWith("ing") && low.length > 5) {
    let stem = low.slice(0, -3);
    const last = stem[stem.length - 1];
    const prev = stem[stem.length - 2];
    if (stem.length >= 2 && last === prev) stem = stem.slice(0, -1);
    return stem;
  }
  if (low.endsWith("ed") && low.length > 4) {
    let stem = low.slice(0, -2);
    const last = stem[stem.length - 1];
    const prev = stem[stem.length - 2];
    if (stem.length >= 2 && last === prev) stem = stem.slice(0, -1);
    return stem;
  }
  if (low.endsWith("es") && low.length > 4) return low.slice(0, -2);
  if (low.endsWith("s") && low.length > 3 && !low.endsWith("ss")) {
    return low.slice(0, -1);
  }
  return low;
}

/** Returns a cleaned vocabulary term or null when the item should be dropped. */
export function sanitizeVocabularyTerm(raw: string): string | null {
  const trimmed = normalizeApostrophes(raw).trim().replace(/\s+/g, " ");
  if (trimmed.length < 2 || trimmed.length > 96) return null;
  if (isProbableProperNoun(trimmed)) return null;
  const contractionHead = SINGLE_TOKEN_HEADWORDS[trimmed.toLowerCase()];
  if (contractionHead) return contractionHead;
  const sanitized = trimmed
    .split(/\s+/)
    .filter((p) => p.length > 0)
    .map((part) => lemmatizeToken(part))
    .join(" ");
  return sanitized.length >= 2 ? sanitized : null;
}
