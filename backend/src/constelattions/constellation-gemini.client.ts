import { Injectable } from "@nestjs/common";

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
            return null;
        }

        const template =
            process.env.GEMINI_PROMPT_CONSTELLATION_GENERATOR ||
            `You are an expert English curriculum designer and a creative sci-fi writer. Break down the provided English learning domain into a logical learning graph (a 'Constellation' made of 'Stars').\nReturn ONLY valid JSON with this exact shape: {"constellationName":"Atmospheric name (e.g. Nebula of Action)","description":"Short lore description","stars":[{"id":"s1","name":"Atmospheric star name","topic":"Concrete grammar/vocab topic","description":"...","prerequisiteIds":[]}]}\n\nCRITICAL RULES:\n- Break the domain into 4 to 8 logical micro-topics (Stars).\n- 'prerequisiteIds' MUST contain the string 'id' of previous stars to form a directed acyclic learning graph. Leave empty [] if it's a starting star.\n- Names MUST be space-themed and atmospheric, but closely tied to the topic meaning.\n- Descriptions must blend lore with the actual educational objective.\n\nDomain: {{DOMAIN}}\nLearner Level: {{LEARNER_CEFR}}`;

        const prompt = template
            .replace(/\{\{DOMAIN\}\}/g, domain)
            .replace(/\{\{LEARNER_CEFR\}\}/g, learnerCefr);

        try {
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

            return JSON.parse(text) as GeneratedConstellation;
        } catch {
            return null;
        }
    }
}