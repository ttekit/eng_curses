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
    const CHUNK_SIZE = 30;
    const finalTranslatedArray: string[] = [];
    const totalChunks = Math.ceil(batch.length / CHUNK_SIZE);

    for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
      const chunk = batch.slice(i, i + CHUNK_SIZE);
      const currentChunkNum = Math.floor(i / CHUNK_SIZE) + 1;

      // this.logger.log(
      //   `Translating chunk ${currentChunkNum} of ${totalChunks}...`,
      // );

      const chunkResult = await this.translateChunkWithRetry(chunk, retries);
      finalTranslatedArray.push(...chunkResult);
    }

    return finalTranslatedArray;
  }

  private async translateChunkWithRetry(
    chunk: string[],
    retries: number,
  ): Promise<string[]> {
    const editorPrompt =
      process.env.SUBTITLE_TRANSLATE_PROMPT ||
      "Translate these subtitles into Ukrainian.";

    const batchObject: Record<string, string> = {};
    chunk.forEach((text, index) => {
      batchObject[String(index)] = text;
    });

    batchObject["_END_"] = "END_OF_BATCH";

    const prompt = `${editorPrompt}
      You will receive a JSON object with numbered keys and one special key "_END_".
      
      STRICT TECHNICAL RULES:
      1. Return ONLY a valid JSON object.
      2. Translate all string values of the numbered keys to Ukrainian.
      3. DO NOT drop, skip, or merge any numbered keys. Translate short fragments (like "but", "scouts.") literally.
      4. The very last key in your output MUST be "_END_": "END_OF_BATCH". Do not close the JSON object until you have outputted this exact key.
      5. Provide NO conversational text or markdown formatting. Just the JSON.
      
      EXAMPLE OUTPUT:
      {"0": "Переклад", "1": "...", "_END_": "END_OF_BATCH"}`;

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
            model: "deepseek-v4-flash",
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
          throw new Error("No JSON object found in response");
        }

        const parsedObj = JSON.parse(jsonMatch[0]);

        const translatedArray: string[] = [];
        for (let i = 0; i < chunk.length; i++) {
          if (parsedObj[String(i)] === undefined) {
            //этот лог пускай будет, пару дней потестить всё ли гуд, потом удалим(до 18.07.2026)
            this.logger.warn(
              `Нейронка обленилась и пропустила ключ "${i}". Оставляем оригинал: "${chunk[i]}"`,
            );
            translatedArray.push(chunk[i]);
          } else {
            translatedArray.push(parsedObj[String(i)]);
          }
        }

        return translatedArray;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        this.logger.warn(
          `Translation chunk attempt ${attempt} failed: ${errorMessage}`,
        );

        if (attempt === retries) {
          throw new InternalServerErrorException(
            "Failed to translate subtitles chunk.",
          );
        }
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
    return [];
  }
}
