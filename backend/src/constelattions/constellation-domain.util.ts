/**
 * Builds the Gemini domain string from CEFR + profile fields.
 */
export function build_constellation_domain(input: {
  readonly cefrLevel: string;
  readonly learningGoal?: string | null;
  readonly workField?: string | null;
  readonly domainOverride?: string;
}): string {
  if (input.domainOverride?.trim()) {
    return input.domainOverride.trim();
  }
  const baseGoal = input.learningGoal?.trim() || "General English";
  const workField = input.workField?.trim();
  if (input.cefrLevel === "A1") {
    return `${baseGoal} — absolute beginner survival English (communicative A1, no alphabet drills)`;
  }
  return workField ? `${baseGoal} (context: ${workField})` : baseGoal;
}
