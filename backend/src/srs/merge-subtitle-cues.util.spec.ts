import { merge_subtitle_cues_for_feed } from "./merge-subtitle-cues.util";

describe("merge-subtitle-cues.util", () => {
  it("merges short consecutive cues to reach minimum duration", () => {
    const merged = merge_subtitle_cues_for_feed([
      { startSec: 0, endSec: 1.5, text: "Hello" },
      { startSec: 1.5, endSec: 3, text: "world" },
      { startSec: 3, endSec: 4.5, text: "How are" },
      { startSec: 4.5, endSec: 6, text: "you?" },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatchObject({
      startSec: 0,
      endSec: 3,
      text: "Hello world",
    });
    expect(merged[1]).toMatchObject({
      startSec: 3,
      endSec: 6,
      text: "How are you?",
    });
  });

  it("keeps a single cue when it already meets minimum duration", () => {
    const merged = merge_subtitle_cues_for_feed([
      { startSec: 10, endSec: 14, text: "This is long enough." },
    ]);
    expect(merged).toEqual([
      { startSec: 10, endSec: 14, text: "This is long enough." },
    ]);
  });

  it("splits batches when max duration would be exceeded", () => {
    const merged = merge_subtitle_cues_for_feed([
      { startSec: 0, endSec: 4, text: "Part one" },
      { startSec: 4, endSec: 8, text: "Part two" },
      { startSec: 8, endSec: 12, text: "Part three" },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[0]?.endSec).toBe(8);
    expect(merged[1]?.startSec).toBe(8);
  });

  it("merges trailing short tail into previous batch when possible", () => {
    const merged = merge_subtitle_cues_for_feed([
      { startSec: 0, endSec: 3.5, text: "Opening line" },
      { startSec: 3.5, endSec: 5, text: "Second line" },
      { startSec: 5, endSec: 6, text: "Tail" },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.text).toBe("Opening line Second line Tail");
  });

  it("drops isolated tail cues that cannot reach minimum duration", () => {
    const merged = merge_subtitle_cues_for_feed([
      { startSec: 0, endSec: 4, text: "Only valid clip" },
      { startSec: 4, endSec: 4.8, text: "Too short" },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.text).toBe("Only valid clip");
  });
});
