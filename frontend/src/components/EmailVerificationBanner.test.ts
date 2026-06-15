import { describe, expect, it } from "vitest";
import { should_show_email_verification_banner } from "../components/EmailVerificationBanner";

describe("should_show_email_verification_banner", () => {
  it("never shows after login (email confirm is not required)", () => {
    expect(should_show_email_verification_banner(true, false)).toBe(false);
    expect(should_show_email_verification_banner(true, true)).toBe(false);
    expect(should_show_email_verification_banner(false, false)).toBe(false);
  });
});
