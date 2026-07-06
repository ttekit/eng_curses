import { Injectable } from "@nestjs/common";
import {
  type ComprehensionTestItem,
  type PriorWeakSpot,
} from "src/content-video/content-video-comprehension-tests-gemini.client";
import { LEARNER_RECAP_MCQ_COUNT } from "./learner-recap-fallback.tests";

export type LearnerRecapGeminiInput = {
  kind: "mistakes" | "weekly" | "monthly";
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

    let prompt = "";

    if (input.kind === "mistakes") {
      const template =
        process.env.GEMINI_PROMPT_RECAP_MISTAKES ||
        `You create a targeted "Work on mistakes" English quiz: exactly {{MCQ_COUNT}} multiple-choice questions ONLY (no open-ended items).\nReturn ONLY valid JSON: {"tests":[...{{MCQ_COUNT}} items...]}\nEach MCQ: {"id":"r1","questionType":"multiple_choice","category":"grammar"|"vocabulary","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}\n\nCRITICAL RULES:\n- Focus STRICTLY on the user's PRIOR MISSES provided below. Create NEW questions testing the exact same grammar rules or vocabulary meanings that the user previously failed.\n- Do NOT ask about video plots or stories.\n- If there are fewer than {{MCQ_COUNT}} prior misses, fill the rest with general grammar/vocabulary questions suited to the learner level and goal.\n\nLearner level: {{LEARNER_LEVEL}}\nGoal: {{LEARNING_GOAL}}\nSaved vocabulary: {{VOCABULARY_TERMS}}\n\nPRIOR MISSES:\n{{WEAK_SPOTS}}`;

      prompt = template
        .replace(/\{\{MCQ_COUNT\}\}/g, String(LEARNER_RECAP_MCQ_COUNT))
        .replace(/\{\{LEARNER_LEVEL\}\}/g, level)
        .replace(/\{\{LEARNING_GOAL\}\}/g, input.learningGoal)
        .replace(
          /\{\{VOCABULARY_TERMS\}\}/g,
          input.vocabularyTerms.slice(0, 30).join(", ") || "(none)",
        )
        .replace(/\{\{WEAK_SPOTS\}\}/g, weak);
    } else {
      const template =
        process.env.GEMINI_PROMPT_RECAP_PERIOD ||
        `You create an English learner {{RECAP_LABEL}} quiz: exactly {{MCQ_COUNT}} multiple-choice questions ONLY (no open-ended items).\nReturn ONLY valid JSON: {"tests":[...{{MCQ_COUNT}} items...]}\nEach MCQ: {"id":"r1","questionType":"multiple_choice","category":"grammar"|"vocabulary"|"comprehension","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}\n\nCRITICAL RULES:\n- Mix roughly 3 grammar, 3 vocabulary, 4 comprehension questions.\n- Ground questions strictly in the TRANSCRIPT EXCERPT and/or lesson titles provided below.\n- Test actual comprehension of the videos watched this period.\n\nLearner level: {{LEARNER_LEVEL}}\nGoal: {{LEARNING_GOAL}}\nHorizon: {{TIME_TO_ACHIEVE}}\nHobbies: {{HOBBIES}}\nSaved vocabulary: {{VOCABULARY_TERMS}}\nLessons in this period: {{LESSON_TITLES}}\n\nTRANSCRIPT EXCERPT:\n{{TRANSCRIPT}}`;

      prompt = template
        .replace(/\{\{RECAP_LABEL\}\}/g, input.recapLabel)
        .replace(/\{\{MCQ_COUNT\}\}/g, String(LEARNER_RECAP_MCQ_COUNT))
        .replace(/\{\{LEARNER_LEVEL\}\}/g, level)
        .replace(/\{\{LEARNING_GOAL\}\}/g, input.learningGoal)
        .replace(/\{\{TIME_TO_ACHIEVE\}\}/g, input.timeToAchieve)
        .replace(/\{\{HOBBIES\}\}/g, input.hobbies.join(", ") || "(none)")
        .replace(
          /\{\{VOCABULARY_TERMS\}\}/g,
          input.vocabularyTerms.slice(0, 30).join(", ") || "(none)",
        )
        .replace(/\{\{LESSON_TITLES\}\}/g, titles)
        .replace(/\{\{TRANSCRIPT\}\}/g, transcript);
    }

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