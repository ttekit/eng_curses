import { describe, expect, it } from "vitest";
import {
  adult_needs_placement_cefr,
  parse_adult_profile_cefr_target,
} from "./placement_cefr";

describe("placement_cefr", () => {
  it("detects missing CEFR for adult", () => {
    expect(
      adult_needs_placement_cefr({ role: "adult", englishLevel: "" }),
    ).toBe(true);
  });

  it("accepts embedded CEFR level", () => {
    expect(parse_adult_profile_cefr_target("Upper B2 speaker")).toBe("B2");
  });
});
