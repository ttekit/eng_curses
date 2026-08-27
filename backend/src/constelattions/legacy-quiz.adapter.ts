import { QuestionType, type LegacyQuizItem, type TextPickQuestion } from "./test-question.types";

/**
 * Maps legacy MCQ items to text_pick questions for backward compatibility.
 */
export function adapt_legacy_quiz_items(
  items: readonly LegacyQuizItem[],
  idPrefix = "legacy",
): TextPickQuestion[] {
  return items.map((item, index) => adapt_legacy_quiz_item(item, `${idPrefix}-${index + 1}`));
}

function adapt_legacy_quiz_item(
  item: LegacyQuizItem,
  id: string,
): TextPickQuestion {
  const options = normalize_legacy_options(item.options, item.correctAnswer);
  return {
    id,
    type: QuestionType.TEXT_PICK,
    prompt: item.question,
    options,
    correctAnswer: item.correctAnswer,
  };
}

function normalize_legacy_options(
  options: readonly string[],
  correctAnswer: string,
): [string, string, string] {
  const unique = [...new Set(options.filter((option) => option.trim().length > 0))];
  if (!unique.includes(correctAnswer)) {
    unique.unshift(correctAnswer);
  }
  while (unique.length < 3) {
    unique.push(`Option ${unique.length + 1}`);
  }
  return [unique[0]!, unique[1]!, unique[2]!];
}

export function is_legacy_quiz_item(value: unknown): value is LegacyQuizItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.question === "string" &&
    Array.isArray(record.options) &&
    record.options.every((option) => typeof option === "string") &&
    typeof record.correctAnswer === "string"
  );
}
