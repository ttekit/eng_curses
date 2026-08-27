import type { TestQuestion } from "../../components/test-session/test-session.types";
import { coerce_dialogue_text } from "../../components/task/format-phrase-dialogue.util";

/**
 * Star payload returned by GET /constellations/star/:id
 */
export type TaskStarType = "VIDEO" | "GRAMMAR" | "READING" | "PHRASE" | "TEST";

export type TaskStar = {
  id: number;
  name: string;
  type?: TaskStarType;
  contentVideoId?: number | null;
  metadata?: Record<string, unknown>;
  normalizedQuestions?: TestQuestion[];
  contentStatus?: "pending" | "generating" | "ready";
  contentReady?: boolean;
};

export type GrammarExample = { en: string; uk: string };
export type QuizItem = {
  question: string;
  options: string[];
  correctAnswer: string;
};
export type PhraseItem = {
  targetPhrase: string;
  translation: string;
  context?: string;
  dialogue?: string;
};

export function asGrammarExamples(value: unknown): GrammarExample[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is GrammarExample =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as GrammarExample).en === "string" &&
      typeof (item as GrammarExample).uk === "string",
  );
}

export function asQuizItems(value: unknown): QuizItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is QuizItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as QuizItem).question === "string" &&
      Array.isArray((item as QuizItem).options) &&
      typeof (item as QuizItem).correctAnswer === "string",
  );
}

export function asPhraseItems(value: unknown): PhraseItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as PhraseItem).targetPhrase === "string",
    )
    .map((item) => {
      const dialogueText = coerce_dialogue_text(item.dialogue);
      return {
        targetPhrase: String(item.targetPhrase),
        translation:
          typeof item.translation === "string" ? item.translation : "",
        context: typeof item.context === "string" ? item.context : undefined,
        dialogue: dialogueText || undefined,
      };
    });
}

export function normalizePhraseInput(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
