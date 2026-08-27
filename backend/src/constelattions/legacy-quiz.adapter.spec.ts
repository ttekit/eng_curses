import { adapt_legacy_quiz_items, is_legacy_quiz_item } from "./legacy-quiz.adapter";
import { QuestionType } from "./test-question.types";

describe("legacy-quiz.adapter", () => {
  it("maps legacy MCQ to text_pick", () => {
    const result = adapt_legacy_quiz_items([
      {
        question: "Яка літера йде після А?",
        options: ["B", "C", "D"],
        correctAnswer: "B",
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe(QuestionType.TEXT_PICK);
    expect(result[0]?.prompt).toBe("Яка літера йде після А?");
    expect(result[0]?.correctAnswer).toBe("B");
  });

  it("guards legacy quiz shape", () => {
    expect(
      is_legacy_quiz_item({
        question: "Test?",
        options: ["a", "b"],
        correctAnswer: "a",
      }),
    ).toBe(true);
    expect(is_legacy_quiz_item({ question: 1 })).toBe(false);
  });
});
