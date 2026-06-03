import {
  hasPaidSubscriptionAccess,
  isSubscriptionEnforcementDisabled,
} from "./subscription-access.util";

describe("subscription-access.util", () => {
  it("hasPaidSubscriptionAccess accepts active and trialing", () => {
    expect(hasPaidSubscriptionAccess("active")).toBe(true);
    expect(hasPaidSubscriptionAccess("trialing")).toBe(true);
    expect(hasPaidSubscriptionAccess("canceled")).toBe(false);
  });

  it("isSubscriptionEnforcementDisabled parses env", () => {
    expect(isSubscriptionEnforcementDisabled("true")).toBe(true);
    expect(isSubscriptionEnforcementDisabled("0")).toBe(false);
  });
});
