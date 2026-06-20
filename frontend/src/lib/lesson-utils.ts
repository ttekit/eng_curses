import {
  type QuizQuestion,
  type TranscriptLine,
  type VocabularyItem,
} from "../components/content-watch/defaultLessonSides";
import { sanitizeVocabularyTerm } from "./vocabularyTermSanitize";
import { appEn } from "../locales/app/en";

export type TabId = "vocabulary" | "transcript" | "quiz";
export type LessonLabels = typeof appEn.lesson;

export type LessonSideBundle = {
  gradingToken?: string;
  keyVocabulary?: { word?: string; definition?: string; example?: string }[];
  tests?: {
    id?: string;
    question?: string;
    questionType?: string;
    options?: string[];
    correctIndex?: number;
    category?: string;
    explanation?: string;
  }[];
};

export const TRANSCRIPT_VOCAB_STOP = new Set(
  "the and that this with from your have been were they their what when will would could should about there which more some very just into also than then only over such".split(
    " ",
  ),
);

export function mapApiTestsToQuiz(
  tests: NonNullable<LessonSideBundle["tests"]>,
): QuizQuestion[] {
  return tests.map((t, idx) => {
    const id =
      typeof t.id === "string" && t.id.trim().length > 0
        ? t.id.trim()
        : `t${idx + 1}`;
    const isOpen = t.questionType === "open" || t.category === "open";

    if (isOpen) {
      return {
        id,
        timestamp: "—",
        question: t.question ?? "",
        questionType: "open",
        options: [],
        correct: 0,
        category: "open",
        explanation:
          typeof t.explanation === "string" ? t.explanation : undefined,
      };
    }

    const opts = [...(t.options ?? [])];
    while (opts.length < 4) opts.push("—");
    const options = opts.slice(0, 4);
    let ci =
      typeof t.correctIndex === "number" && Number.isFinite(t.correctIndex)
        ? Math.floor(t.correctIndex)
        : 0;
    ci = Math.max(0, Math.min(options.length - 1, ci));
    const catRaw = t.category;
    const category =
      catRaw === "grammar"
        ? "grammar"
        : catRaw === "vocabulary"
          ? "vocabulary"
          : catRaw === "comprehension"
            ? "comprehension"
            : undefined;

    return {
      id,
      timestamp: "—",
      question: t.question ?? "",
      questionType: "multiple_choice",
      options,
      correct: ci,
      category,
      explanation:
        typeof t.explanation === "string" ? t.explanation : undefined,
    };
  });
}

export function rawKeyVocabularyFromTestsPayload(payload: unknown): unknown[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return [];
  const o = payload as Record<string, unknown>;
  const nested =
    o.data && typeof o.data === "object" && !Array.isArray(o.data)
      ? (o.data as Record<string, unknown>)
      : null;
  const kv =
    o.keyVocabulary ??
    o.key_vocabulary ??
    nested?.keyVocabulary ??
    nested?.key_vocabulary;
  return Array.isArray(kv) ? kv : [];
}

export function normalizeLessonVocabulary(raw: unknown): VocabularyItem[] {
  const rows = Array.isArray(raw) ? raw : [];
  const out: VocabularyItem[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const wordRaw =
      typeof r.word === "string"
        ? r.word
        : typeof r.term === "string"
          ? r.term
          : typeof r.label === "string"
            ? r.label
            : "";
    const word = sanitizeVocabularyTerm(wordRaw);
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    let definition =
      typeof r.definition === "string"
        ? r.definition.trim()
        : typeof r.meaning === "string"
          ? r.meaning.trim()
          : "";
    const translationRaw =
      typeof r.translation === "string" ? r.translation.trim() : "";
    const pronunciationRaw =
      typeof r.pronunciation === "string" ? r.pronunciation.trim() : "";
    if (word.length < 2) continue;
    if (definition.length < 2)
      definition = `A useful word from this lesson: “${word}”.`;
    out.push({
      word,
      meaning: definition,
      translation: translationRaw.length > 0 ? translationRaw : undefined,
      pronunciation: pronunciationRaw.length > 0 ? pronunciationRaw : undefined,
    });
  }
  return out.slice(0, 16);
}

export function buildVocabularyFromTranscript(
  lines: TranscriptLine[],
): VocabularyItem[] {
  const text = lines.map((l) => l.text).join(" ");
  if (text.trim().length < 12) return [];
  const found = new Set<string>();
  const re = /\p{L}[\p{L}\p{M}'-]{1,30}\p{L}|\p{L}{3,32}/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && found.size < 20) {
    const w = m[0];
    if (w.length < 3 || w.length > 48) continue;
    const low = w.toLowerCase();
    if (low.length <= 5 && TRANSCRIPT_VOCAB_STOP.has(low)) continue;
    const sanitized = sanitizeVocabularyTerm(w);
    if (!sanitized) continue;
    found.add(sanitized);
  }
  const words = [...found].slice(0, 10);
  return words.map((word) => ({ word, meaning: "" }));
}

export function extractQuizKeyVocabTerms(
  vocabulary: VocabularyItem[] | undefined,
): string[] {
  if (!vocabulary?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of vocabulary) {
    const w = v.word?.trim();
    if (!w || w.length < 2 || w.length > 120) continue;
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
    if (out.length >= 50) break;
  }
  return out;
}

export function extractQuizKeyVocabDetails(
  vocabulary: VocabularyItem[] | undefined,
  enriched: VocabularyItem[],
) {
  const terms = extractQuizKeyVocabTerms(vocabulary);
  const map = new Map(
    enriched.map((v) => [v.word.trim().toLowerCase(), v] as const),
  );
  return terms.map((term) => {
    const item = map.get(term.trim().toLowerCase());
    const tr = item?.translation?.trim();
    const mean = item?.meaning?.trim();
    return {
      term,
      nativeTranslation: tr && tr.length > 0 ? tr : null,
      learnerDescription: mean && mean.length > 0 ? mean : null,
    };
  });
}

export function applyVocabularyHints(
  items: VocabularyItem[],
  hints: Record<string, any>,
): VocabularyItem[] {
  return items.map((item) => {
    const h = hints[item.word.toLowerCase()];
    if (!h) return item;
    const t = h.translation?.trim();
    const p = h.pronunciation?.trim();
    const m = h.meaning?.trim();
    const useMeaning =
      m && m.length > 0
        ? m
        : item.meaning.trim().length > 0
          ? item.meaning
          : "";
    return {
      ...item,
      translation: t || item.translation,
      pronunciation: p || item.pronunciation,
      meaning: useMeaning,
    };
  });
}

export function extractOpenWrittenAnswer(
  answers: Record<string, number | string>,
  questions: QuizQuestion[],
): string | undefined {
  for (const q of questions) {
    if (q.questionType === "open" || q.category === "open") {
      const v = answers[q.id];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  let best = "";
  for (const v of Object.values(answers)) {
    if (typeof v !== "string") continue;
    const t = v.trim();
    if (t.length > best.length) best = t;
  }
  return best.length >= 12 ? best : undefined;
}

export function readOpenEndedFeedbackFromSubmit(
  data: unknown,
): string | null | undefined {
  if (data == null || typeof data !== "object" || Array.isArray(data))
    return undefined;
  const o = data as Record<string, unknown>;
  const raw =
    o.openEndedFeedback ?? o.open_ended_feedback ?? o.openSummaryFeedback;
  if (raw === null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  return undefined;
}

export function readWrittenSummaryScoreFromSubmit(
  data: unknown,
): number | null | undefined {
  if (data == null || typeof data !== "object" || Array.isArray(data))
    return undefined;
  const o = data as Record<string, unknown>;
  const raw = o.writtenSummaryScore ?? o.written_summary_score;
  if (raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const r = Math.round(raw);
    if (r >= 1 && r <= 10) return r;
  }
  return undefined;
}

export function splitLongTranscriptLines(
  lines: TranscriptLine[],
  maxChars = 80,
): TranscriptLine[] {
  const out: TranscriptLine[] = [];
  const softLimit = Math.floor(maxChars * 0.5);

  for (const line of lines) {
    if (
      !line.text ||
      typeof line.startSec !== "number" ||
      typeof line.endSec !== "number"
    ) {
      out.push(line);
      continue;
    }
    if (line.text.length <= maxChars) {
      out.push(line);
      continue;
    }

    const words = line.text.split(" ");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const word of words) {
      const hasPunctuation = /[.,!?;:]$/.test(word);
      const nextLength =
        (currentChunk ? currentChunk.length + 1 : 0) + word.length;

      if (nextLength > maxChars && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? " " : "") + word;
        if (hasPunctuation && currentChunk.length >= softLimit) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    const totalDuration = line.endSec - line.startSec;
    const totalChars = chunks.reduce((acc, c) => acc + c.length, 0);

    const currentStart = line.startSec;
    for (const chunk of chunks) {
      const chunkDuration = (chunk.length / totalChars) * totalDuration;
      const chunkEnd = currentStart + chunkDuration;
      const m = Math.floor(currentStart / 60);
      const s = Math.floor(currentStart % 60);
      const timeLabel = `${m}:${s.toString().padStart(2, "0")}`;

      out.push({
        ...line,
        time: timeLabel,
        startSec: currentStart,
        endSec: chunkEnd,
        text: chunk,
      });
    }
  }
  return out;
}
