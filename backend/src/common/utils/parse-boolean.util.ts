/**
 * Parses typical env-style boolean strings ("true", "1", "yes", "on").
 */
export function parseBoolean(raw: string): boolean {
  const s = String(raw ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}
