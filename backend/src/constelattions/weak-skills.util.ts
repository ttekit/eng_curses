/**
 * Picks the weakest skill label from aggregated alcorythm topic scores.
 */
export function resolve_weak_skills_from_rows(
  languageRows: Array<{
    listeningScore: number;
    vocabularyScore: number;
    grammarScore: number;
  }>,
): string[] {
  if (languageRows.length === 0) return [];
  const totals = { listening: 0, vocabulary: 0, grammar: 0 };
  for (const row of languageRows) {
    totals.listening += row.listeningScore;
    totals.vocabulary += row.vocabularyScore;
    totals.grammar += row.grammarScore;
  }
  const n = languageRows.length;
  const scores = [
    { skill: "listening", value: totals.listening / n },
    { skill: "vocabulary", value: totals.vocabulary / n },
    { skill: "grammar", value: totals.grammar / n },
  ].sort((a, b) => a.value - b.value);
  const weakest = scores[0];
  if (!weakest || weakest.value >= 0.4) return [];
  return [weakest.skill];
}
