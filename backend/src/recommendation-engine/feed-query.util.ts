export function parse_exclude_segment_ids(raw?: string): number[] {
  if (!raw?.trim()) {
    return [];
  }
  const ids = new Set<number>();
  for (const part of raw.split(",")) {
    const parsed = Number.parseInt(part.trim(), 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      ids.add(parsed);
    }
  }
  return [...ids];
}
