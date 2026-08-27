import { describe, expect, it } from "vitest";
import { format_phrase_dialogue } from "./format-phrase-dialogue.util";

describe("format_phrase_dialogue", () => {
  it("removes A/B speaker prefixes from inline dialogue", () => {
    expect(
      format_phrase_dialogue("A: Hello, I am Alex. B: Hello, I am Sarah."),
    ).toEqual(["Hello, I am Alex.", "Hello, I am Sarah."]);
  });

  it("handles dialogue provided as string array", () => {
    expect(
      format_phrase_dialogue(["Hello, I am Alex.", "Hello, I am Sarah."]),
    ).toEqual(["Hello, I am Alex.", "Hello, I am Sarah."]);
  });

  it("keeps plain multiline dialogue unchanged", () => {
    expect(format_phrase_dialogue("Hello!\nNice to meet you.")).toEqual([
      "Hello!",
      "Nice to meet you.",
    ]);
  });

  it("returns empty array for invalid dialogue values", () => {
    expect(format_phrase_dialogue(null)).toEqual([]);
    expect(format_phrase_dialogue({ lines: [] })).toEqual([]);
  });
});
