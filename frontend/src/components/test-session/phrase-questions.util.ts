import type { PhraseItem } from "../../pages/content/task-page.types";
import {
  QuestionType,
  type SwipeCardQuestion,
  type TestQuestion,
  type TextPickQuestion,
} from "./test-session.types";

/**
 * Builds text-only interactive questions from PHRASE star metadata.
 */
export function build_phrase_questions(
  phrases: readonly PhraseItem[],
): TestQuestion[] {
  if (phrases.length === 0) {
    return [];
  }
  return phrases.flatMap((phrase, index) => [
    build_text_pick(phrase, index, phrases),
    build_swipe_card(phrase, index, phrases),
  ]);
}

function build_text_pick(
  phrase: PhraseItem,
  index: number,
  phrases: readonly PhraseItem[],
): TextPickQuestion {
  return {
    id: `phrase-${index + 1}-pick`,
    type: QuestionType.TEXT_PICK,
    prompt: `Оберіть англійську фразу для перекладу: «${phrase.translation}»`,
    options: build_translation_options(phrases, index),
    correctAnswer: phrase.targetPhrase,
  };
}

function build_swipe_card(
  phrase: PhraseItem,
  index: number,
  phrases: readonly PhraseItem[],
): SwipeCardQuestion {
  const distractors = phrases
    .filter((_, itemIndex) => itemIndex !== index)
    .slice(0, 2);
  return {
    id: `phrase-${index + 1}-swipe`,
    type: QuestionType.SWIPE_CARD,
    cards: [
      {
        id: `${index}-match`,
        word: phrase.targetPhrase,
        hint: phrase.translation,
        isMatch: true,
      },
      ...distractors.map((item, distractorIndex) => ({
        id: `${index}-distractor-${distractorIndex}`,
        word: item.targetPhrase,
        hint: item.translation,
        isMatch: false,
      })),
    ],
  };
}

function build_translation_options(
  phrases: readonly PhraseItem[],
  currentIndex: number,
): [string, string, string] {
  const correct = phrases[currentIndex]?.targetPhrase ?? "";
  const distractors = phrases
    .filter((_, index) => index !== currentIndex)
    .map((phrase) => phrase.targetPhrase)
    .filter((value) => value !== correct);
  const options = [
    correct,
    distractors[0] ?? "Not quite",
    distractors[1] ?? "Try again",
  ];
  return [options[0]!, options[1]!, options[2]!];
}
