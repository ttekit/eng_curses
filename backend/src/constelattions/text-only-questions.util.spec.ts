import { QuestionType } from "./test-question.types";
import { to_text_only_questions } from "./text-only-questions.util";

describe("to_text_only_questions", () => {
  it("converts video_riddle to text_pick", () => {
    const result = to_text_only_questions([
      {
        id: "q1",
        type: QuestionType.VIDEO_RIDDLE,
        subtitleWithBlank: "I ___ here.",
        options: ["am", "is", "are", "be"],
        correctAnswer: "am",
      },
    ]);
    expect(result[0]?.type).toBe(QuestionType.TEXT_PICK);
    expect(result[0]).toMatchObject({
      correctAnswer: "am",
      options: ["am", "is", "are"],
    });
  });

  it("converts blind_audio and sanitizes hear prompts", () => {
    const result = to_text_only_questions([
      {
        id: "q2",
        type: QuestionType.BLIND_AUDIO,
        prompt: "Що ви чуєте?",
        options: ["hello", "goodbye", "thanks"],
        correctAnswer: "hello",
      },
    ]);
    expect(result[0]?.type).toBe(QuestionType.TEXT_PICK);
    expect(result[0]).toMatchObject({
      prompt: "Оберіть правильну відповідь",
      correctAnswer: "hello",
    });
  });

  it("strips segment from sentence_builder", () => {
    const result = to_text_only_questions([
      {
        id: "q3",
        type: QuestionType.SENTENCE_BUILDER,
        targetPhrase: "hello world",
        wordChips: ["world", "hello"],
        segment: { startTimeSec: 0, endTimeSec: 5 },
      },
    ]);
    expect(result[0]).toEqual({
      id: "q3",
      type: QuestionType.SENTENCE_BUILDER,
      targetPhrase: "hello world",
      wordChips: ["world", "hello"],
    });
  });
});
