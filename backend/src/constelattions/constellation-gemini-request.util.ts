import { Logger } from "@nestjs/common";

const logger = new Logger("ConstellationGeminiRequest");

type GeminiResponse = {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

/**
 * Sends a prompt to Gemini and parses JSON from the response.
 */
export async function fetch_gemini_json<T>(
  prompt: string,
  logLabel: string,
): Promise<T | null> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const apiUrl =
    process.env.GEMINI_API_URL ||
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("GEMINI_API_KEY is missing");
    return null;
  }
  let retries = 2;
  while (retries >= 0) {
    try {
      const res = await fetch(`${apiUrl}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) {
        logger.error(`Gemini HTTP ${res.status} for ${logLabel}`);
        return null;
      }
      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) {
        return null;
      }
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        return null;
      }
      return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as T;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (retries === 0) {
        logger.error(`Gemini ${logLabel} failed: ${message}`);
        return null;
      }
      retries -= 1;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  return null;
}
