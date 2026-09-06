import { constellation_needs_regeneration } from "./constellation-stale.util";
import { StarContentStatus } from "./star-content.util";

describe("constellation-stale.util", () => {
  it("flags FOUNDATION kind as stale", () => {
    expect(
      constellation_needs_regeneration({
        id: 1,
        kind: "FOUNDATION",
        stars: [],
      }),
    ).toBe(true);
  });

  it("does not flag lazy-plan constellations with pending stars", () => {
    expect(
      constellation_needs_regeneration({
        id: 1,
        kind: "PERSONAL",
        stars: [
          {
            type: "GRAMMAR",
            metadata: {
              contentStatus: StarContentStatus.PENDING,
              canDo: "goal",
            },
          },
        ],
      }),
    ).toBe(false);
  });

  it("flags legacy quiz metadata on old full-generation constellations", () => {
    expect(
      constellation_needs_regeneration({
        id: 1,
        kind: "PERSONAL",
        stars: [
          {
            type: "GRAMMAR",
            metadata: {
              quiz: [{ question: "Q", options: ["a"], correctAnswer: "a" }],
            },
          },
        ],
      }),
    ).toBe(true);
  });
});
