import { Injectable } from '@nestjs/common';
import {
  AI_PROMPT_ENV_KEYS,
  DEFAULT_PROMPT_TAG_SCORE,
} from 'src/config/ai-prompts.defaults';
import { buildAiPrompt } from 'src/config/ai-prompts';
import { clamp } from './alcorythm-scoring.util';

type GeminiTagBatchInput = {
  tagNames: string[];
  englishLevel?: string | null;
  nativeLanguage?: string | null;
  knownLanguages: string[];
  knownLanguageLevels: Array<{ language: string; level: string }>;
  education?: string | null;
  workField?: string | null;
  job?: string | null;
  hobbies: string[];
  selectedTopicNames: string[];
  deterministicScores: Record<string, number>;
};

@Injectable()
export class AlcorythmGeminiTagScoreClient {
  async scoreTags(input: GeminiTagBatchInput): Promise<Record<string, number> | null> {
    if (!input.tagNames.length) {
      return {};
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';
    const apiUrl =
      process.env.GEMINI_API_URL ||
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const prompt = buildAiPrompt(
      AI_PROMPT_ENV_KEYS.tagScore,
      DEFAULT_PROMPT_TAG_SCORE,
      {
        TAGS: input.tagNames.join(', '),
        ENGLISH_LEVEL: input.englishLevel ?? 'unknown',
        NATIVE_LANGUAGE: input.nativeLanguage ?? 'unknown',
        KNOWN_LANGUAGES: input.knownLanguages.join(', ') || 'none',
        KNOWN_LANGUAGE_LEVELS: input.knownLanguageLevels.length
          ? JSON.stringify(input.knownLanguageLevels)
          : 'none',
        EDUCATION: input.education ?? 'unknown',
        WORK_FIELD: input.workField ?? 'unknown',
        JOB: input.job ?? 'unknown',
        HOBBIES: input.hobbies.join(', ') || 'none',
        SELECTED_TOPICS: input.selectedTopicNames.join(', ') || 'none',
        DETERMINISTIC_SCORES: JSON.stringify(input.deterministicScores),
      },
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as any;

      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== 'string') {
        return null;
      }

      const parsed = JSON.parse(text) as Record<string, number>;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      const normalized: Record<string, number> = {};
      for (const tagName of input.tagNames) {
        const raw = parsed[tagName];
        if (typeof raw === 'number') {
          normalized[tagName] = clamp(raw);
        }
      }

      return normalized;
    } catch {
      return null;
    }
  }
}
