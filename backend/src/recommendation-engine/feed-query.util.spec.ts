import { parse_exclude_segment_ids } from "./feed-query.util";

describe("feed-query.util", () => {
  it("parses comma-separated exclude ids", () => {
    expect(parse_exclude_segment_ids("1, 2,abc,3")).toEqual([1, 2, 3]);
  });

  it("returns empty list for blank input", () => {
    expect(parse_exclude_segment_ids("")).toEqual([]);
    expect(parse_exclude_segment_ids(undefined)).toEqual([]);
  });
});
