import {
  normalize_translate_words,
  should_translate_to_lang,
} from "./word-translate.util";

describe("word-translate.util", () => {
  it("normalizes and deduplicates words", () => {
    expect(normalize_translate_words(["Hello", " hello", ""])).toEqual(["hello"]);
    expect(normalize_translate_words(["must,", "must"])).toEqual(["must"]);
  });

  it("returns null lang for english targets", () => {
    expect(should_translate_to_lang("en")).toBeNull();
    expect(should_translate_to_lang("uk")).toBe("uk");
  });
});
