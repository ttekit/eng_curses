import {
  asGrammarExamples,
  asPhraseItems,
  type TaskStar,
} from "../pages/content/task-page.types";

export type StarContentStatus = "pending" | "generating" | "ready";

export function read_content_status(star: TaskStar): StarContentStatus {
  const status = star.metadata?.contentStatus;
  if (status === "ready" || status === "generating" || status === "pending") {
    return status;
  }
  return is_star_lesson_ready(star) ? "ready" : "pending";
}

export function is_star_lesson_ready(star: TaskStar): boolean {
  if (star.contentReady === true) {
    return true;
  }
  const metadata = star.metadata ?? {};
  if (metadata.contentStatus === "ready") {
    return true;
  }
  if (star.type === "PHRASE") {
    return asPhraseItems(metadata.phrases).length > 0;
  }
  if (star.type === "GRAMMAR") {
    const rule = typeof metadata.rule === "string" ? metadata.rule : "";
    return rule.length > 50 && asGrammarExamples(metadata.examples).length > 0;
  }
  if (star.type === "READING") {
    const text = typeof metadata.text === "string" ? metadata.text : "";
    const questions = Array.isArray(metadata.questions) ? metadata.questions : [];
    return text.trim().length > 40 && questions.length > 0;
  }
  if (star.type === "TEST") {
    const questions = star.normalizedQuestions ?? [];
    if (questions.length > 0) {
      return true;
    }
    return Array.isArray(metadata.questions) && metadata.questions.length > 0;
  }
  if (star.type === "VIDEO") {
    const summary = typeof metadata.summary === "string" ? metadata.summary : "";
    return summary.length > 20;
  }
  return false;
}

export function loading_message_for_status(
  status: StarContentStatus,
): string {
  if (status === "generating") {
    return "Генеруємо вправи та приклади…";
  }
  return "Готуємо ваш урок…";
}
