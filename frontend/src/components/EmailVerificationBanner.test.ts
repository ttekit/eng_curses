import { describe, expect, it } from "vitest";
import { should_show_email_verification_banner } from "../lib/emailVerificationBanner";

describe("should_show_email_verification_banner", () => {
  it("shows for signed-in users with unverified email after placement", () => {
    expect(should_show_email_verification_banner(true, false, true)).toBe(true);
  });

  it("hides until entry placement is finished", () => {
    expect(should_show_email_verification_banner(true, false, false)).toBe(
      false,
    );
    expect(
      should_show_email_verification_banner(true, false, undefined),
    ).toBe(false);
  });

  it("hides for verified or signed-out users", () => {
    expect(should_show_email_verification_banner(true, true, true)).toBe(false);
    expect(should_show_email_verification_banner(false, false, true)).toBe(
      false,
    );
  });
});
