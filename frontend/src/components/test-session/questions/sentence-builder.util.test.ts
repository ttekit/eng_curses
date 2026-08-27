import { describe, expect, it } from "vitest";
import { grade_sentence, normalize_phrase } from "./sentence-builder.util";

describe("sentence-builder.util", () => {
  it("grades matching phrases", () => {
    expect(
      grade_sentence(["where", "is", "my", "coffee"], "where is my coffee"),
    ).toBe(true);
  });

  it("rejects wrong order", () => {
    expect(
      grade_sentence(["my", "coffee", "where", "is"], "where is my coffee"),
    ).toBe(false);
  });

  it("normalizes punctuation", () => {
    expect(normalize_phrase("Where is my coffee?")).toBe("where is my coffee");
  });
});
