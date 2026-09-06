import {
  is_context_shift_candidate,
  is_new_candidate,
  is_review_candidate,
} from "./word-set-filter.util";

describe("word-set-filter.util", () => {
  const known = new Set(["hello", "world", "the"]);
  const learning = new Set(["quick", "brown"]);

  it("accepts review candidates with at least one learning word", () => {
    expect(is_review_candidate(["hello", "quick"], known, learning)).toBe(true);
    expect(
      is_review_candidate(["hello", "quick", "brown"], known, learning),
    ).toBe(true);
  });

  it("rejects review without learning words", () => {
    expect(is_review_candidate(["hello", "world"], known, learning)).toBe(false);
  });

  it("accepts i+1 candidates with one or more unknown words", () => {
    expect(is_new_candidate(["hello", "fox"], known, learning)).toBe(true);
    expect(is_new_candidate(["hello", "fox", "jump"], known, learning)).toBe(
      true,
    );
  });

  it("rejects i+1 with no unknown words", () => {
    expect(is_new_candidate(["hello", "world"], known, learning)).toBe(false);
  });

  it("accepts context shift when clicked word is only non-known", () => {
    expect(is_context_shift_candidate(["hello", "fox"], "fox", known)).toBe(
      true,
    );
  });
});
