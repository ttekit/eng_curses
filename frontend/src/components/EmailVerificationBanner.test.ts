import { describe, expect, it } from "vitest";
import { should_show_email_verification_banner } from "../lib/emailVerificationBanner";

describe("should_show_email_verification_banner", () => {
  it("shows for signed-in users with unverified email", () => {
    expect(should_show_email_verification_banner(true, false)).toBe(true);
  });

  it("hides for verified or signed-out users", () => {
    expect(should_show_email_verification_banner(true, true)).toBe(false);
    expect(should_show_email_verification_banner(false, false)).toBe(false);
    expect(should_show_email_verification_banner(false, undefined)).toBe(false);
  });
});
