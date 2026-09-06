export function is_review_candidate(
  segmentWords: string[],
  knownWords: Set<string>,
  learningWords: Set<string>,
): boolean {
  if (segmentWords.length === 0) {
    return false;
  }
  const learningInSegment = segmentWords.filter((word) =>
    learningWords.has(word),
  );
  if (learningInSegment.length === 0) {
    return false;
  }
  const union = new Set<string>([...knownWords, ...learningWords]);
  return segmentWords.every((word) => union.has(word));
}

export function is_new_candidate(
  segmentWords: string[],
  knownWords: Set<string>,
  learningWords: Set<string>,
): boolean {
  if (segmentWords.length === 0) {
    return false;
  }
  const union = new Set<string>([...knownWords, ...learningWords]);
  const unknownWords = segmentWords.filter((word) => !union.has(word));
  return unknownWords.length >= 1;
}

export function is_context_shift_candidate(
  segmentWords: string[],
  clickedWord: string,
  knownWords: Set<string>,
): boolean {
  if (!segmentWords.includes(clickedWord)) {
    return false;
  }
  return segmentWords
    .filter((word) => word !== clickedWord)
    .every((word) => knownWords.has(word));
}

export function intersect_learning_words(
  segmentWords: string[],
  learningWords: Set<string>,
): string[] {
  return segmentWords.filter((word) => learningWords.has(word));
}

export function to_word_set(words: string[]): Set<string> {
  return new Set(words.map((word) => word.toLowerCase()));
}

export function merge_known_and_learning(
  knownWords: string[],
  learningWords: string[],
): string[] {
  return [...new Set([...knownWords, ...learningWords])];
}
