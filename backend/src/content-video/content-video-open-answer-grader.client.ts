import { Injectable } from "@nestjs/common";
import {
  AI_PROMPT_ENV_KEYS,
  DEFAULT_PROMPT_OPEN_ANSWER_GRADER,
} from "src/config/ai-prompts.defaults";
import { buildAiPrompt } from "src/config/ai-prompts";

/** Correct on the written summary when the model score reaches this minimum (inclusive). */
export const OPEN_SUMMARY_PASS_MIN_SCORE = 7;

export type OpenSummaryGrade = {
  /** Integer 1–10 from the model */
  score: number;
  /** Derived: {@link score} >= {@link OPEN_SUMMARY_PASS_MIN_SCORE} */
  pass: boolean;
  /** Coaching: relevance to video, grammar, and study tips */
  feedback: string;
};

/** Optional profile for tailoring vocabulary/grammar memorization advice. */
export type LearnerProfileHints = {
  job: string | null;
  education: string | null;
  hobbies: string[];
};

export function parseOpenSummaryScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const r = Math.round(value);
    if (r < 1 || r > 10) {
      return null;
    }
    return r;
  }
  if (typeof value === "string") {
    const n = Number.parseInt(value.trim(), 10);
    if (!Number.isFinite(n)) {
      return null;
    }
    if (n < 1 || n > 10) {
      return null;
    }
    return n;
  }
  return null;
}

/**
 * Pass/fail plus short learning feedback for the learner's written summary.
 */
@Injectable()
export class ContentVideoOpenAnswerGraderClient {
  /**
   * Binary pass/fail only — used when callers do not need feedback.
   * Prefer {@link gradeOpenSummary} in new code.
   */
  async isSummaryAdequate(input: {
    videoName: string;
    videoDescription: string | null;
    transcriptPlain: string | null;
    learnerAnswer: string;
    learnerCefr: string | null;
    learnerProfile?: LearnerProfileHints | null;
  }): Promise<boolean | null> {
    const r = await this.gradeOpenSummary(input);
    if (!r) return null;
    return r.pass;
  }

  async gradeOpenSummary(input: {
    videoName: string;
    videoDescription: string | null;
    transcriptPlain: string | null;
    learnerAnswer: string;
    learnerCefr: string | null;
    learnerProfile?: LearnerProfileHints | null;
  }): Promise<OpenSummaryGrade | null> {
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const apiUrl =
      process.env.GEMINI_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const transcriptChunk =
      input.transcriptPlain != null && input.transcriptPlain.trim().length >= 40
        ? input.transcriptPlain.trim().slice(0, 6000)
        : "(no transcript — judge only from title and description)";

    const lp = input.learnerProfile;
    const hasProfile =
      lp != null &&
      (Boolean(lp.job?.trim()) ||
        Boolean(lp.education?.trim()) ||
        (lp.hobbies?.length ?? 0) > 0);

    const profileLines = hasProfile
      ? [
          "LEARNER PROFILE (use only to personalize study tips — do not invent facts):",
          lp!.job?.trim()
            ? `Job / role: ${lp!.job.trim()}`
            : "Job / role: (not provided)",
          lp!.education?.trim()
            ? `Education: ${lp!.education.trim()}`
            : "Education: (not provided)",
          lp!.hobbies && lp!.hobbies.length > 0
            ? `Hobbies / interests: ${lp!.hobbies.slice(0, 14).join("; ")}`
            : "Hobbies / interests: (not provided)",
          "",
        ]
      : [
          "LEARNER PROFILE: not provided — memorization tips should be generally useful.",
          "",
        ];

    const prompt = buildAiPrompt(
      AI_PROMPT_ENV_KEYS.openAnswerGrader,
      DEFAULT_PROMPT_OPEN_ANSWER_GRADER,
      {
        PASS_MIN_SCORE: String(OPEN_SUMMARY_PASS_MIN_SCORE),
        PROFILE_BLOCK: profileLines.join("\n"),
        VIDEO_NAME: input.videoName,
        VIDEO_DESCRIPTION: input.videoDescription?.trim() || "N/A",
        LEARNER_CEFR: input.learnerCefr?.trim() || "B1",
        TRANSCRIPT_CHUNK: transcriptChunk,
        LEARNER_ANSWER: input.learnerAnswer.trim().slice(0, 1200),
      },
    );

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string") {
        return null;
      }
      const parsed = JSON.parse(text) as {
        score?: unknown;
        feedback?: unknown;
      };
      const score = parseOpenSummaryScore(parsed?.score);
      if (score === null) {
        return null;
      }
      const feedback =
        typeof parsed?.feedback === "string" ? parsed.feedback.trim() : "";
      if (!feedback) {
        return null;
      }
      const pass = score >= OPEN_SUMMARY_PASS_MIN_SCORE;
      return {
        score,
        pass,
        feedback: feedback.slice(0, 2000),
      };
    } catch {
      return null;
    }
  }
}

/** Fallback when the grading API is unavailable: length + sentence boundaries. */
export function heuristicOpenSummaryPass(text: string): boolean {
  const t = text.trim();
  if (t.length < 40) {
    return false;
  }
  const sentences = t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 5);
  return sentences.length >= 2;
}

/** Short copy when the grading API is not configured or the request failed. */
export function offlineOpenSummaryFeedback(pass: boolean): string {
  return pass
    ? "Your summary meets the minimum length and structure. Next time, add one specific example or phrase you heard in the lesson to make it even stronger."
    : "Aim for two or three sentences that state what the video was mainly about and mention one concrete detail (idea, example, or tip) from what you watched.";
}
