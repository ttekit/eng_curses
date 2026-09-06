import { QuestionType, type TestQuestion } from "./test-session.types";

/**
 * Five varied demo questions — text-only interactive types.
 */
export const MOCK_TEST_QUESTIONS: TestQuestion[] = [
  {
    id: "demo-tp",
    type: QuestionType.TEXT_PICK,
    prompt: "Оберіть правильний варіант: I ___ here.",
    options: ["am", "is", "are"],
    correctAnswer: "am",
  },
  {
    id: "demo-swipe",
    type: QuestionType.SWIPE_CARD,
    cards: [
      { id: "c1", word: "coffee", hint: "кава", isMatch: true },
      { id: "c2", word: "chair", hint: "стілець", isMatch: false },
      { id: "c3", word: "water", hint: "вода", isMatch: true },
    ],
  },
  {
    id: "demo-sb",
    type: QuestionType.SENTENCE_BUILDER,
    targetPhrase: "where is my coffee",
    wordChips: ["coffee", "where", "my", "is"],
  },
  {
    id: "demo-tp2",
    type: QuestionType.TEXT_PICK,
    prompt: "Що означає «there»?",
    options: ["там", "тут", "де"],
    correctAnswer: "там",
  },
  {
    id: "demo-rc",
    type: QuestionType.REWARD_CHECKPOINT,
    message: "Great pace! Keep going!",
  },
];
