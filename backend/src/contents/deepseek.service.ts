import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.deepseek.com/v1/chat/completions";

  constructor(private config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>("DEEPSEEK_API_KEY");
  }

  async translateSubtitles(lines: string[]): Promise<string[]> {
    const BATCH_SIZE = 50;
    const translatedLines: string[] = [];

    for (let i = 0; i < lines.length; i += BATCH_SIZE) {
      const batch = lines.slice(i, i + BATCH_SIZE);
      const translatedBatch = await this.translateBatchWithRetry(batch);
      translatedLines.push(...translatedBatch);
    }

    return translatedLines;
  }

  private async translateBatchWithRetry(
    batch: string[],
    retries = 3,
  ): Promise<string[]> {
    const editorPrompt = process.env.SUBTITLE_TRANSLATE_PROMPT;
    const prompt = `${editorPrompt}
      You will receive a JSON array of strings to translate.
      STRICT TECHNICAL RULES:
      1. Return ONLY a valid JSON array of strings.
      2. Do NOT merge or split lines.
      3. The output array MUST have exactly ${batch.length} elements.
      4. Keep the exact same order.
      5. Provide NO conversational text, markdown formatting, or explanations. Just the JSON array.`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "deepseek-v4-flash",
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: JSON.stringify(batch) },
            ],
            temperature: 0.1,
          }),
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("No JSON array found in response");

        const parsed: string[] = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(parsed) || parsed.length !== batch.length) {
          throw new Error(
            `Length mismatch: expected ${batch.length}, got ${parsed?.length}`,
          );
        }

        return parsed;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn(
          `Translation attempt ${attempt} failed: ${errorMessage}`,
        );

        if (attempt === retries) {
          throw new InternalServerErrorException(
            "Failed to translate subtitles.",
          );
        }
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
    return [];
  }
}
