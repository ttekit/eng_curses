/**
 * Strips speaker labels like "A:" / "B:" from phrase dialogue text.
 */
export function format_phrase_dialogue(dialogue: unknown): string[] {
  const normalized = coerce_dialogue_text(dialogue);
  if (!normalized) {
    return [];
  }
  if (/\b[A-Z]\s*:\s*/.test(normalized)) {
    return normalized
      .split(/\b[A-Z]\s*:\s*/g)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
  return normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function coerce_dialogue_text(dialogue: unknown): string {
  if (typeof dialogue === "string") {
    return dialogue.trim();
  }
  if (Array.isArray(dialogue)) {
    return dialogue
      .filter((line): line is string => typeof line === "string")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }
  return "";
}

export { coerce_dialogue_text };
