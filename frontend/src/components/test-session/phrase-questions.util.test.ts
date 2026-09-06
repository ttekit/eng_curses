import { describe, expect, it } from "vitest";
import { build_phrase_questions } from "./phrase-questions.util";

const phrases = [
  { targetPhrase: "How are you?", translation: "Як справи?" },
  { targetPhrase: "I am fine", translation: "У мене все добре" },
  { targetPhrase: "I am good", translation: "У мене все чудово" },
];

describe("build_phrase_questions", () => {
  it("creates text pick and swipe card per phrase", () => {
    const questions = build_phrase_questions(phrases);
    expect(questions).toHaveLength(6);
    expect(questions[0]?.type).toBe("text_pick");
    expect(questions[1]?.type).toBe("swipe_card");
  });

  it("uses the phrase translation as text pick prompt", () => {
    const questions = build_phrase_questions(phrases);
    const pick = questions.find((item) => item.id === "phrase-1-pick");
    expect(pick?.type).toBe("text_pick");
    if (pick?.type === "text_pick") {
      expect(pick.prompt).toContain("Як справи?");
      expect(pick.correctAnswer).toBe("How are you?");
    }
  });
});
