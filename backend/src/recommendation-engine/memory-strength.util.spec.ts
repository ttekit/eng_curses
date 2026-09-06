import {
  apply_click_penalty,
  apply_complete_review,
  should_promote_to_known,
} from "./memory-strength.util";

describe("memory-strength.util", () => {
  it("increases strength on complete review", () => {
    const next = apply_complete_review(2, 1);
    expect(next).toBeGreaterThan(2);
  });

  it("penalizes on click", () => {
    expect(apply_click_penalty(10)).toBe(5);
    expect(apply_click_penalty(1.2)).toBe(1);
  });

  it("promotes when above threshold", () => {
    expect(should_promote_to_known(21)).toBe(true);
    expect(should_promote_to_known(19)).toBe(false);
  });
});
