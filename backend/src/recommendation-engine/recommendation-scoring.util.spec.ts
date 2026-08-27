import { hash_embed } from "./hash-embedding.util";
import {
  build_score_breakdown,
  compute_context_distance,
  compute_shift_score,
} from "./recommendation-scoring.util";

describe("recommendation-scoring.util", () => {
  const lexicon = {
    knownWords: new Set(["hello"]),
    learningWords: new Map([
      [
        "world",
        {
          word: "world",
          lastSeenAt: new Date(Date.now() - 86_400_000),
          memoryStrength: 2,
        },
      ],
    ]),
  };

  it("builds weighted feed score", () => {
    const vector = hash_embed("travel adventure");
    const breakdown = build_score_breakdown({
      interestsVector: vector,
      contextVector: vector,
      userLevel: 2,
      segmentLevel: 2,
      userAccent: "general-american",
      segmentAccent: "general-american",
      segmentWords: ["hello", "world"],
      lexicon,
    });
    expect(breakdown.total).toBeGreaterThan(0.5);
    expect(breakdown.sAccent).toBe(1);
  });

  it("computes context distance", () => {
    const left = hash_embed("city night");
    const right = hash_embed("forest morning");
    expect(compute_context_distance(left, right)).toBeGreaterThan(0);
  });

  it("computes shift score", () => {
    const score = compute_shift_score({ dCos: 0.8, sContext: 0.4, sAccent: 1 });
    expect(score).toBeCloseTo(0.76, 2);
  });
});
