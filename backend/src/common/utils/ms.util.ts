/**
 * Parses a duration string (or plain milliseconds) for session `maxAge` and similar.
 * Supports: `ms`, `s`, `m`, `h`, `d`, `w`, `y` suffixes and raw integer milliseconds.
 */
export type StringValue = string;

export function ms(input: string): number {
  const s = input.trim();
  if (!s) {
    throw new Error("Empty duration string");
  }
  if (/^\d+$/.test(s)) {
    return Number.parseInt(s, 10);
  }
  const match = s.match(/^(\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?|w|weeks?|y|years?)?$/i);
  if (!match) {
    throw new Error(`Invalid duration: ${input}`);
  }
  const n = Number.parseFloat(match[1]!);
  const unit = (match[2] ?? "ms").toLowerCase();
  const multipliers: Record<string, number> = {
    ms: 1,
    millisecond: 1,
    milliseconds: 1,
    s: 1000,
    sec: 1000,
    second: 1000,
    seconds: 1000,
    m: 60_000,
    min: 60_000,
    minute: 60_000,
    minutes: 60_000,
    h: 3_600_000,
    hr: 3_600_000,
    hour: 3_600_000,
    hours: 3_600_000,
    d: 86_400_000,
    day: 86_400_000,
    days: 86_400_000,
    w: 604_800_000,
    week: 604_800_000,
    weeks: 604_800_000,
    y: 31_536_000_000,
    year: 31_536_000_000,
    years: 31_536_000_000,
  };
  const m = multipliers[unit];
  if (m === undefined) {
    throw new Error(`Unsupported duration unit: ${unit}`);
  }
  return Math.round(n * m);
}
