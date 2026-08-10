import { Injectable, Logger } from "@nestjs/common";
import { DEFAULT_PROMPT_CONSTELLATION_GENERATOR } from "src/config/ai-prompts/constellation-generator.prompt";

export interface GeneratedStar {
    id: string;
    name: string;
    topic: string;
    description: string;
    prerequisiteIds: string[];
    type?: 'VIDEO' | 'GRAMMAR' | 'READING' | 'PHRASE' | 'TEST';
    metadata?: any;
}

export interface GeneratedConstellation {
    constellationName: string;
    description: string;
    stars: GeneratedStar[];
}

@Injectable()
export class ConstellationGeminiClient {
    private readonly logger = new Logger(ConstellationGeminiClient.name);

    async generateConstellation(
        domain: string,
        learnerCefr: string,
    ): Promise<GeneratedConstellation | null> {
        const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        const apiUrl =
            process.env.GEMINI_API_URL ||
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            this.logger.error("GEMINI_API_KEY is missing in environment variables!");
            return null;
        }

        const template =
            process.env.GEMINI_PROMPT_CONSTELLATION_GENERATOR ||
            DEFAULT_PROMPT_CONSTELLATION_GENERATOR;

        const prompt = template
            .replace(/\{\{DOMAIN\}\}/g, domain)
            .replace(/\{\{LEARNER_CEFR\}\}/g, learnerCefr);

        let retries = 2;
        while (retries >= 0) {
            try {
                this.logger.log(`Sending request to Gemini for domain: "${domain}", CEFR: ${learnerCefr}`);

                const res = await fetch(`${apiUrl}?key=${encodeURIComponent(apiKey)}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            responseMimeType: "application/json",
                        },
                    }),
                });

                if (!res.ok) {
                    const errText = await res.text();
                    this.logger.error(`Gemini API HTTP Error: ${res.status} ${res.statusText} - ${errText}`);
                    return null;
                }

                const data = await res.json() as any;

                const finishReason = data.candidates?.[0]?.finishReason;
                if (finishReason && finishReason !== 'STOP') {
                    this.logger.warn(`Gemini stopped generation unexpectedly. Reason: ${finishReason}`);
                }

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (!text) {
                    this.logger.error("Gemini returned empty text.");
                    return null;
                }

                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');

                if (firstBrace === -1 || lastBrace === -1) {
                    this.logger.error("No JSON structure found in text.");
                    return null;
                }

                const cleanJson = text.slice(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(cleanJson) as GeneratedConstellation;

                this.logger.log(`Successfully parsed constellation: "${parsed.constellationName}" with ${parsed.stars?.length || 0} stars.`);
                return parsed;

            } catch (error: any) {
                if (retries === 0) {
                    this.logger.error(`Network or fetch exception after retries: ${error.message}`);
                    return null;
                }
                this.logger.warn(`Fetch failed (${error.message}), retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                retries--;
            }
        }
        return null;
    }
}