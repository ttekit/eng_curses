import type { QuizQuestion } from "../components/content-watch/defaultLessonSides";

/** Parses display timestamps like `1:30`, `0:45`, or `90` into seconds. */
export function parseTimestampToSec(raw: string): number | null {
  const t = raw.trim();
  if (!t || t === "—" || t === "-") return null;
  if (/^\d+$/.test(t)) {
    const n = Number.parseInt(t, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  const parts = t.split(":").map((p) => p.trim());
  if (parts.length === 2) {
    const m = Number.parseInt(parts[0] ?? "", 10);
    const s = Number.parseInt(parts[1] ?? "", 10);
    if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0) {
      return null;
    }
    return m * 60 + s;
  }
  if (parts.length === 3) {
    const h = Number.parseInt(parts[0] ?? "", 10);
    const m = Number.parseInt(parts[1] ?? "", 10);
    const s = Number.parseInt(parts[2] ?? "", 10);
    if (
      !Number.isFinite(h) ||
      !Number.isFinite(m) ||
      !Number.isFinite(s) ||
      h < 0 ||
      m < 0 ||
      s < 0
    ) {
      return null;
    }
    return h * 3600 + m * 60 + s;
  }
  return null;
}

export function formatSecAsTimestamp(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function isOpenQuizQuestion(q: QuizQuestion): boolean {
  return q.questionType === "open" || q.category === "open";
}

export function isMcqQuizQuestion(q: QuizQuestion): boolean {
  return !isOpenQuizQuestion(q);
}

/**
 * Ensures each MCQ has a numeric cue time. Uses parsed `timestamp` when present;
 * otherwise spreads cues between 12% and 88% of the clip duration.
 */
export function assignMcqCueTimes(
  questions: QuizQuestion[],
  videoDurationSec: number,
): QuizQuestion[] {
  const mcqs = questions.filter(isMcqQuizQuestion);
  const dur =
    Number.isFinite(videoDurationSec) && videoDurationSec > 30
      ? videoDurationSec
      : 0;
  const startFrac = 0.12;
  const endFrac = 0.88;
  const span = Math.max(1, endFrac - startFrac);

  return questions.map((q) => {
    if (isOpenQuizQuestion(q)) return q;
    const parsed = parseTimestampToSec(q.timestamp);
    if (parsed != null) {
      return { ...q, timestampSec: parsed, timestamp: formatSecAsTimestamp(parsed) };
    }
    const idx = mcqs.findIndex((m) => m.id === q.id);
    if (idx < 0) return q;
    const count = Math.max(1, mcqs.length);
    const frac = startFrac + (span * (idx + 0.5)) / count;
    const cueSec =
      dur > 0 ? Math.min(dur - 2, Math.max(2, Math.floor(dur * frac))) : idx * 45 + 30;
    return {
      ...q,
      timestampSec: cueSec,
      timestamp: formatSecAsTimestamp(cueSec),
    };
  });
}

/** MCQ cues sorted ascending; open-ended items are excluded. */
export function mcqQuestionsWithCues(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .filter(isMcqQuizQuestion)
    .filter((q) => typeof q.timestampSec === "number" && q.timestampSec >= 0)
    .sort((a, b) => (a.timestampSec ?? 0) - (b.timestampSec ?? 0));
}
