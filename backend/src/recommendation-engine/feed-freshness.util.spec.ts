import {
  apply_feed_freshness_penalty,
  SEEN_SEGMENT_SCORE_FACTOR,
  WATCHED_VIDEO_SCORE_FACTOR,
} from "./feed-freshness.util";

describe("feed-freshness.util", () => {
  it("penalizes previously seen segments most strongly", () => {
    const seen = apply_feed_freshness_penalty(1, {
      segmentId: 10,
      contentVideoId: 5,
      seenSegmentIds: new Set([10]),
      watchedVideoIds: new Set([5]),
    });
    expect(seen).toBe(SEEN_SEGMENT_SCORE_FACTOR);
  });

  it("penalizes watched videos when segment is unseen", () => {
    const watched = apply_feed_freshness_penalty(1, {
      segmentId: 11,
      contentVideoId: 5,
      seenSegmentIds: new Set([10]),
      watchedVideoIds: new Set([5]),
    });
    expect(watched).toBe(WATCHED_VIDEO_SCORE_FACTOR);
  });

  it("keeps fresh content at full score", () => {
    const fresh = apply_feed_freshness_penalty(0.8, {
      segmentId: 12,
      contentVideoId: 6,
      seenSegmentIds: new Set([10]),
      watchedVideoIds: new Set([5]),
    });
    expect(fresh).toBe(0.8);
  });
});
