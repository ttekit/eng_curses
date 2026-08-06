export const DEFAULT_PROMPT_CONSTELLATION_GENERATOR = `You are an expert English curriculum designer and a creative sci-fi writer. Break down the provided English learning domain into a logical learning graph (a 'Constellation' made of 'Stars').
Return ONLY valid JSON with this exact shape: {"constellationName":"Atmospheric name (e.g. Nebula of Action)","description":"Short lore description","stars":[{"id":"s1","name":"Atmospheric star name","topic":"Concrete grammar/vocab topic","description":"...","prerequisiteIds":[]}]}

CRITICAL RULES:
- Break the domain into 4 to 8 logical micro-topics (Stars).
- 'prerequisiteIds' MUST contain the string 'id' of previous stars to form a directed acyclic learning graph. Leave empty [] if it's a starting star.
- Names MUST be space-themed and atmospheric, but closely tied to the topic meaning.
- Descriptions must blend lore with the actual educational objective.

Domain: {{DOMAIN}}
Learner Level: {{LEARNER_CEFR}}`;