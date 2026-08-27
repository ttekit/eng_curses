import {
  is_feed_eligible_duration,
  MIN_FEED_SEGMENT_DURATION_SEC,
} from "./segment-duration.util";

describe("segment-duration.util", () => {
  it("requires at least 3 seconds", () => {
    expect(MIN_FEED_SEGMENT_DURATION_SEC).toBe(3);
    expect(is_feed_eligible_duration(0, 2.99)).toBe(false);
    expect(is_feed_eligible_duration(1, 4)).toBe(true);
  });
});
