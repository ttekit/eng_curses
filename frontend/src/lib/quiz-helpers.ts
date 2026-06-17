import { QuizAnswerRow } from "../components/types/teacher-videos";


// Ищет первую попавшуюся строку по переданным ключам
export function read_quiz_string(row: QuizAnswerRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

// Ищет первое попавшееся число по переданным ключам
export function read_quiz_number(row: QuizAnswerRow, keys: string[]): number {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return -1; // -1 означает, что число не найдено
}

// Извлекает массив вариантов ответов (options или choices)
export function read_quiz_options(row: QuizAnswerRow): string[] {
  const raw = row.options ?? row.choices;
  if (!Array.isArray(raw)) return [];
  // Фильтруем, чтобы оставить только строки
  return raw.filter((opt): opt is string => typeof opt === "string");
}
