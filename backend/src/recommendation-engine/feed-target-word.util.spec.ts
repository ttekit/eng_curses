import {
  resolve_feed_target_word,
  resolve_new_target_word,
  resolve_review_target_word,
} from "./feed-target-word.util";
import { filter_learnable_words } from "../srs/proper-noun.util";

describe("feed-target-word.util", () => {
  const known = new Set(["hello", "world", "the"]);
  const learning = new Map([
    ["quick", { memoryStrength: 2, lastSeenAt: new Date("2026-01-01") }],
    ["brown", { memoryStrength: 1, lastSeenAt: new Date("2026-01-02") }],
  ]);

  it("returns the first unknown word for new clips", () => {
    expect(
      resolve_new_target_word(["hello", "fox"], known, new Set(["quick"])),
    ).toBe("fox");
    expect(
      resolve_new_target_word(["hello", "fox", "jump"], known, new Set(["quick"])),
    ).toBe("fox");
  });

  it("returns null when no unknown words exist", () => {
    expect(
      resolve_new_target_word(["hello", "world"], known, new Set(["quick"])),
    ).toBeNull();
  });

  it("returns the only learning word for review clips", () => {
    expect(resolve_review_target_word(["hello", "quick"], learning)).toBe(
      "quick",
    );
  });

  it("picks the weakest learning word when several are present", () => {
    expect(
      resolve_review_target_word(["hello", "quick", "brown"], learning),
    ).toBe("brown");
  });

  it("resolves one marked word for feed enrichment", () => {
    expect(
      resolve_feed_target_word(["hello", "fox"], "new", {
        knownWords: known,
        learningWords: learning,
      }),
    ).toBe("fox");
    expect(
      resolve_feed_target_word(["hello", "quick"], "review", {
        knownWords: known,
        learningWords: learning,
      }),
    ).toBe("quick");
  });

  it("skips proper nouns when selecting learnable words", () => {
    const phrase =
      "Oh, and and Dorothy's been thinking about birthdays and has a birthday question.";
    const segmentWords = ["dorothy's", "been", "thinking", "birthdays", "birthday", "question"];
    const learnable = filter_learnable_words(segmentWords, phrase);
    expect(learnable).not.toContain("dorothy's");
    expect(
      resolve_new_target_word(learnable, known, new Set(["quick"])),
    ).toBe("been");
  });
});
