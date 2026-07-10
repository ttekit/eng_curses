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

  public async translateBatchWithRetry(
    batch: string[],
    retries = 3,
  ): Promise<string[]> {
    const editorPrompt =
      process.env.SUBTITLE_TRANSLATE_PROMPT ||
      "Translate these subtitles into Ukrainian.";

    const batchObject: Record<string, string> = {};
    batch.forEach((text, index) => {
      batchObject[String(index)] = text;
    });

    const prompt = `${editorPrompt}
      You will receive a JSON object where keys are stringified numbers (indexes) and values are English strings.
      STRICT TECHNICAL RULES:
      1. Return ONLY a valid JSON object.
      2. Keep the EXACT SAME keys. Do not add, remove, or skip any keys.
      3. Translate the values to Ukrainian.
      4. Do NOT merge or split lines.
      5. Provide NO conversational text, markdown formatting, or explanations. Just the JSON object.
      EXAMPLE OUTPUT:
      {"0": "Переклад першого рядка", "1": "Переклад другого рядка"}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "deepseek-v4-pro",
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: JSON.stringify(batchObject) },
            ],
            temperature: 0.0,
            max_tokens: 8192,
            response_format: { type: "json_object" },
          }),
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        let content = data.choices[0].message.content;

        content = content
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          this.logger.error(`🚨 СЕТЬ ВЕРНУЛА МУСОР: ${content}`);
          throw new Error("No JSON object found in response");
        }

        const parsedObj = JSON.parse(jsonMatch[0]);

        // 3. СОБИРАЕМ МАССИВ ОБРАТНО СТРОГО ПО ИНДЕКСАМ
        const translatedArray: string[] = [];
        for (let i = 0; i < batch.length; i++) {
          if (parsedObj[String(i)] === undefined) {
            // 🚨 ВМЕСТО КРАША СЕРВЕРА - ПРОСТО ЛОГИРУЕМ И ВСТАВЛЯЕМ ОРИГИНАЛ
            this.logger.warn(
              `⚠️ Нейронка обленилась и пропустила ключ "${i}". Оставляем оригинал: "${batch[i]}"`,
            );
            translatedArray.push(batch[i]); // Фолбек на английский текст
          } else {
            translatedArray.push(parsedObj[String(i)]);
          }
        }

        return translatedArray;
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
