import { compareRecommendationPriority, encodePriorityScore } from "./content-recommendation-ranking.util";
import type { RecommendationScoreParts } from "./content-recommendation.scoring";

function parts(
  overrides: Partial<RecommendationScoreParts>,
): RecommendationScoreParts {
  return {
    cefr: 0,
    complexity: 0,
    themes: 0,
    topicKnowledge: 0,
    phaseTopics: 0,
    genres: 0,
    ...overrides,
  };
}

describe("content-recommendation-ranking.util", () => {
  it("prioritizes level before phase topics and genres", () => {
    const higherLevel = parts({ cefr: 1, phaseTopics: 0, genres: 0 });
    const higherTopics = parts({ cefr: 0.5, phaseTopics: 1, genres: 1 });
    expect(compareRecommendationPriority(higherLevel, higherTopics)).toBe(-1);
  });

  it("prioritizes phase topics before genres when level matches", () => {
    const topicMatch = parts({ cefr: 0.8, phaseTopics: 1, genres: 0 });
    const genreMatch = parts({ cefr: 0.8, phaseTopics: 0.2, genres: 1 });
    expect(compareRecommendationPriority(topicMatch, genreMatch)).toBe(-1);
  });

  it("encodes tiered score with level dominant", () => {
    const levelFirst = encodePriorityScore(
      parts({ cefr: 1, phaseTopics: 0, genres: 0 }),
    );
    const topicFirst = encodePriorityScore(
      parts({ cefr: 0.5, phaseTopics: 1, genres: 1 }),
    );
    expect(levelFirst).toBeGreaterThan(topicFirst);
  });
});
