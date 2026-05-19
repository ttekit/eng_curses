import { Injectable } from "@nestjs/common";
import {
  type ComprehensionTestItem,
  type PriorWeakSpot,
} from "src/content-video/content-video-comprehension-tests-gemini.client";
import { LEARNER_RECAP_MCQ_COUNT } from "./learner-recap-fallback.tests";

export type LearnerRecapGeminiInput = {
  recapLabel: string;
  lessonTitles: string[];
  combinedTranscript: string;
  learnerCefr: string | null;
  vocabularyTerms: string[];
  priorWeakSpots: PriorWeakSpot[];
  learningGoal: string;
  timeToAchieve: string;
  hobbies: string[];
};

function isMcq(
  t: ComprehensionTestItem,
): t is Extract<ComprehensionTestItem, { questionType: "multiple_choice" }> {
  return t.questionType === "multiple_choice";
}

function normalizeMcqTests(raw: unknown): ComprehensionTestItem[] {
  if (!raw || typeof raw !== "object") {
    return [];
  }
  const tests = (raw as { tests?: unknown }).tests;
  if (!Array.isArray(tests)) {
    return [];
  }
  const out: ComprehensionTestItem[] = [];
  for (const row of tests) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    if (o.questionType !== "multiple_choice") continue;
    if (
      typeof o.id !== "string" ||
      typeof o.question !== "string" ||
      !Array.isArray(o.options) ||
      typeof o.correctIndex !== "number"
    ) {
      continue;
    }
    const category = o.category;
    if (
      category !== "grammar" &&
      category !== "vocabulary" &&
      category !== "comprehension"
    ) {
      continue;
    }
    const options = o.options
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 6);
    if (options.length < 4) continue;
    const correctIndex = Math.min(
      Math.max(0, Math.floor(o.correctIndex)),
      options.length - 1,
    );
    out.push({
      questionType: "multiple_choice",
      id: o.id.slice(0, 40),
      category,
      question: o.question.trim().slice(0, 500),
      options,
      correctIndex,
      explanation:
        typeof o.explanation === "string"
          ? o.explanation.trim().slice(0, 600)
          : "",
    });
    if (out.length >= LEARNER_RECAP_MCQ_COUNT) break;
  }
  return out;
}

/**
 * Gemini client for weekly / monthly / mistakes recap quizzes (MCQ only).
 */
@Injectable()
export class LearnerRecapGeminiClient {
  async generateRecapTests(
    input: LearnerRecapGeminiInput,
  ): Promise<ComprehensionTestItem[] | null> {
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const apiUrl =
      process.env.GEMINI_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    const level =
      input.learnerCefr?.trim() ||
      "Unknown — assume high B1: clear sentences, common idioms.";
    const titles =
      input.lessonTitles.length > 0
        ? input.lessonTitles.slice(0, 12).join("; ")
        : "(no lesson titles)";
    const weak =
      input.priorWeakSpots.length > 0
        ? input.priorWeakSpots
            .slice(0, 8)
            .map(
              (w) =>
                `- [${w.category}] (missed ${w.missCount}x) ${w.stemSnippet.slice(0, 200)}`,
            )
            .join("\n")
        : "(no prior misses on record)";
    const transcript =
      input.combinedTranscript.trim().length >= 40
        ? input.combinedTranscript.trim().slice(0, 14000)
        : "(no transcript — use lesson titles only; do not invent specific plot details.)";
    const prompt = `You create an English learner ${input.recapLabel} quiz: exactly ${LEARNER_RECAP_MCQ_COUNT} multiple-choice questions ONLY (no open-ended items).
Return ONLY valid JSON: {"tests":[...${LEARNER_RECAP_MCQ_COUNT} items...]}
Each MCQ: {"id":"r1","questionType":"multiple_choice","category":"grammar"|"vocabulary"|"comprehension","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}
Mix roughly 3 grammar, 3 vocabulary, 4 comprehension. Ground questions in the transcript and/or lesson titles. For "mistakes" style recaps, retest similar skills to PRIOR MISSES in new wording.
Learner level: ${level}
Goal: ${input.learningGoal}
Horizon: ${input.timeToAchieve}
Hobbies: ${input.hobbies.join(", ") || "(none)"}
Saved vocabulary: ${input.vocabularyTerms.slice(0, 30).join(", ") || "(none)"}
Lessons in this period: ${titles}
PRIOR MISSES:
${weak}
TRANSCRIPT EXCERPT:
${transcript}`;

    try {
      const res = await fetch(`${apiUrl}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        return null;
      }
      const parsed: unknown = JSON.parse(text);
      const tests = normalizeMcqTests(parsed).filter(isMcq);
      return tests.length >= 6 ? tests.slice(0, LEARNER_RECAP_MCQ_COUNT) : null;
    } catch {
      return null;
    }
  }
}
