/**
 * Grades a built sentence against the target phrase.
 */
export function grade_sentence(
  built: readonly string[],
  targetPhrase: string,
): boolean {
  const normalizedBuilt = normalize_phrase(built.join(" "));
  const normalizedTarget = normalize_phrase(targetPhrase);
  return normalizedBuilt === normalizedTarget && normalizedBuilt.length > 0;
}

export function normalize_phrase(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export function shuffle_chips(chips: readonly string[]): string[] {
  const copy = [...chips];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}
