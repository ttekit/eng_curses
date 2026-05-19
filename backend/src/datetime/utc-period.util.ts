/**
 * UTC week (Mon 00:00 – next Mon) and calendar month boundaries.
 */

export function getUtcMondayWeekRange(now = new Date()): {
  weekStart: Date;
  weekEndExclusive: Date;
} {
  const x = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dow = x.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  x.setUTCDate(x.getUTCDate() + offset);
  x.setUTCHours(0, 0, 0, 0);
  const weekEndExclusive = new Date(x);
  weekEndExclusive.setUTCDate(weekEndExclusive.getUTCDate() + 7);
  return { weekStart: x, weekEndExclusive };
}

/** `YYYY-MM-DD` for the Monday of the week containing `date`. */
export function formatUtcWeekStartDate(date: Date): string {
  const { weekStart } = getUtcMondayWeekRange(date);
  return weekStart.toISOString().slice(0, 10);
}

export function getUtcCalendarMonthRange(now = new Date()): {
  monthStart: Date;
  monthEndExclusive: Date;
} {
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const monthEndExclusive = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return { monthStart, monthEndExclusive };
}

/** `YYYY-MM` for the UTC calendar month containing `date`. */
export function formatUtcMonthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
