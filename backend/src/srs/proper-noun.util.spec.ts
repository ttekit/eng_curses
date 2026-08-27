import { filter_learnable_words, list_proper_noun_words } from "./proper-noun.util";
import { tokenize_phrase } from "./tokenize-phrase.util";

describe("proper-noun.util", () => {
  it("marks mid-sentence capitalized tokens as proper nouns", () => {
    const phrase =
      "Oh, and and Dorothy's been thinking about birthdays and has a birthday question.";
    const tokens = tokenize_phrase(phrase);
    const dorothy = tokens.find((token) => token.word === "dorothy's");
    expect(dorothy?.isProperNoun).toBe(true);
    expect(list_proper_noun_words(phrase).has("dorothy's")).toBe(true);
  });

  it("does not mark sentence-initial capitalized words as proper nouns", () => {
    const phrase = "Hello world";
    const tokens = tokenize_phrase(phrase);
    expect(tokens[0]?.isProperNoun).toBe(false);
  });

  it("filters names out of learnable segment words", () => {
    const phrase =
      "Oh, and and Dorothy's been thinking about birthdays and has a birthday question.";
    const segmentWords = tokenize_phrase(phrase).map((token) => token.word);
    const learnable = filter_learnable_words(segmentWords, phrase);
    expect(learnable).not.toContain("dorothy's");
    expect(learnable).toContain("thinking");
  });
});
