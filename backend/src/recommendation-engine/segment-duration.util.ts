import { Prisma } from "@generated/prisma/client";

export const MIN_FEED_SEGMENT_DURATION_SEC = 3;
export const MAX_FEED_SEGMENT_DURATION_SEC = 10;

export const feed_min_duration_clause = Prisma.sql`AND (vs.end_time_sec - vs.start_time_sec) >= ${MIN_FEED_SEGMENT_DURATION_SEC}`;

export function is_feed_eligible_duration(
  startTimeSec: number,
  endTimeSec: number,
): boolean {
  return endTimeSec - startTimeSec >= MIN_FEED_SEGMENT_DURATION_SEC;
}
