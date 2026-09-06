import type { PrismaService } from "src/prisma.service";

export type FeedFreshnessContext = {
  seenSegmentIds: ReadonlySet<number>;
  watchedVideoIds: ReadonlySet<number>;
};

export const SEEN_SEGMENT_SCORE_FACTOR = 0.2;
export const WATCHED_VIDEO_SCORE_FACTOR = 0.55;

export async function load_feed_freshness_context(
  prisma: PrismaService,
  userId: number,
): Promise<FeedFreshnessContext> {
  const [seenRows, watchRows] = await Promise.all([
    prisma.userSegmentSeen.findMany({
      where: { userId },
      select: { segmentId: true },
    }),
    prisma.watchSession.findMany({
      where: { userId, completed: true },
      select: { contentVideoId: true },
      distinct: ["contentVideoId"],
    }),
  ]);
  return {
    seenSegmentIds: new Set(seenRows.map((row) => row.segmentId)),
    watchedVideoIds: new Set(watchRows.map((row) => row.contentVideoId)),
  };
}

export function apply_feed_freshness_penalty(
  total: number,
  input: {
    segmentId: number;
    contentVideoId: number;
    seenSegmentIds: ReadonlySet<number>;
    watchedVideoIds: ReadonlySet<number>;
  },
): number {
  if (input.seenSegmentIds.has(input.segmentId)) {
    return total * SEEN_SEGMENT_SCORE_FACTOR;
  }
  if (input.watchedVideoIds.has(input.contentVideoId)) {
    return total * WATCHED_VIDEO_SCORE_FACTOR;
  }
  return total;
}
