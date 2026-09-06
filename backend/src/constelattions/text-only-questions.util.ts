import {
  QuestionType,
  type BlindAudioQuestion,
  type SentenceBuilderQuestion,
  type TestQuestion,
  type TextPickQuestion,
  type VideoRiddleQuestion,
} from "./test-question.types";

const HEAR_PROMPT_PATTERN =
  /що ви чуєте|what do you hear|build the phrase you hear|phrase you hear/i;

/**
 * Converts legacy video/audio questions into text-only tasks.
 */
export function to_text_only_questions(
  questions: readonly TestQuestion[],
): TestQuestion[] {
  return questions
    .map(convert_question_to_text_only)
    .filter((question): question is TestQuestion => question !== null);
}

function convert_question_to_text_only(
  question: TestQuestion,
): TestQuestion | null {
  if (question.type === QuestionType.VIDEO_RIDDLE) {
    return convert_video_riddle(question);
  }
  if (question.type === QuestionType.BLIND_AUDIO) {
    return convert_blind_audio(question);
  }
  if (question.type === QuestionType.SENTENCE_BUILDER) {
    return strip_segment(question);
  }
  if (question.type === QuestionType.REWARD_CHECKPOINT) {
    return { ...question, segment: undefined };
  }
  return question;
}

function convert_video_riddle(
  question: VideoRiddleQuestion,
): TextPickQuestion {
  const options = [...question.options].slice(0, 3) as [string, string, string];
  while (options.length < 3) {
    options.push(`Option ${options.length + 1}`);
  }
  return {
    id: question.id,
    type: QuestionType.TEXT_PICK,
    prompt: `Оберіть правильний варіант: ${question.subtitleWithBlank}`,
    options: [options[0]!, options[1]!, options[2]!],
    correctAnswer: question.correctAnswer,
  };
}

function convert_blind_audio(
  question: BlindAudioQuestion,
): TextPickQuestion {
  return {
    id: question.id,
    type: QuestionType.TEXT_PICK,
    prompt: sanitize_text_prompt(question.prompt),
    options: question.options,
    correctAnswer: question.correctAnswer,
  };
}

function strip_segment(
  question: SentenceBuilderQuestion,
): SentenceBuilderQuestion {
  return {
    id: question.id,
    type: QuestionType.SENTENCE_BUILDER,
    prompt: question.prompt,
    targetPhrase: question.targetPhrase,
    wordChips: question.wordChips,
  };
}

function sanitize_text_prompt(prompt: string | undefined): string | undefined {
  if (!prompt || HEAR_PROMPT_PATTERN.test(prompt)) {
    return "Оберіть правильну відповідь";
  }
  return prompt;
}
