import {
  apply_review,
  compute_retrievability,
  MAX_STABILITY_DAYS,
  MIN_STABILITY_DAYS,
} from "./spaced-repetition.util";

describe("spaced-repetition.util", () => {
  it("computes retrievability decay", () => {
    const high = compute_retrievability(4, 0);
    const low = compute_retrievability(4, 4);
    expect(high).toBe(1);
    expect(low).toBeCloseTo(0.5, 5);
  });

  it("increases stability on correct review", () => {
    const result = apply_review({
      stability: 2,
      isCorrect: true,
      timeSinceLastReviewSec: 86_400,
    });
    expect(result.stability).toBeGreaterThan(2);
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("drops stability on incorrect review", () => {
    const result = apply_review({
      stability: 10,
      isCorrect: false,
      timeSinceLastReviewSec: 86_400,
    });
    expect(result.stability).toBe(4);
    expect(result.nextReviewAt.getTime()).toBeLessThanOrEqual(
      Date.now() + MIN_STABILITY_DAYS * 86_400_000 + 1000,
    );
  });

  it("clamps stability to max on repeated success", () => {
    const result = apply_review({
      stability: MAX_STABILITY_DAYS,
      isCorrect: true,
      timeSinceLastReviewSec: 0,
    });
    expect(result.stability).toBe(MAX_STABILITY_DAYS);
  });
});
