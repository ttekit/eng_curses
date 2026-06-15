import {
  isLearnerCefrBelowB1,
  normalizedLearnerCefrBand,
} from "./cefr-vocabulary-target.util";

describe("isLearnerCefrBelowB1", () => {
  it("returns true for Pre-A1, A1, and A2", () => {
    expect(isLearnerCefrBelowB1("Pre-A1")).toBe(true);
    expect(isLearnerCefrBelowB1("A1")).toBe(true);
    expect(isLearnerCefrBelowB1("a2")).toBe(true);
    expect(isLearnerCefrBelowB1("beginner")).toBe(true);
    expect(isLearnerCefrBelowB1("elementary")).toBe(true);
  });

  it("returns false for B1 and above", () => {
    expect(isLearnerCefrBelowB1("B1")).toBe(false);
    expect(isLearnerCefrBelowB1("B2")).toBe(false);
    expect(isLearnerCefrBelowB1("intermediate")).toBe(false);
    expect(isLearnerCefrBelowB1("advanced")).toBe(false);
  });

  it("returns false when level cannot be parsed", () => {
    expect(isLearnerCefrBelowB1(null)).toBe(false);
    expect(isLearnerCefrBelowB1("")).toBe(false);
    expect(isLearnerCefrBelowB1("unknown")).toBe(false);
  });
});

describe("normalizedLearnerCefrBand", () => {
  it("normalizes common labels", () => {
    expect(normalizedLearnerCefrBand("a1")).toBe("A1");
    expect(normalizedLearnerCefrBand("B1")).toBe("B1");
  });
});
