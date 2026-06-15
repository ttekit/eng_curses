import {
  MOBILE_CAPTCHA_DONE_TOKEN,
  has_mobile_captcha_done_token,
  has_mobile_client_signal,
  should_skip_turnstile_for_mobile,
} from "./mobile-client.util";

function mockRequest(
  headers: Record<string, string | string[]>,
  body?: Record<string, unknown>,
) {
  return {
    headers,
    header: (name: string) => {
      const value = headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    },
    body: body ?? {},
  };
}

describe("mobile-client.util", () => {
  it("detects mobile header signal", () => {
    const request = mockRequest({ "x-explys-client": "mobile" });
    expect(has_mobile_client_signal(request)).toBe(true);
    expect(should_skip_turnstile_for_mobile(request)).toBe(true);
  });

  it("detects mobile clientType in body", () => {
    const request = mockRequest({}, { clientType: "mobile" });
    expect(has_mobile_client_signal(request)).toBe(true);
    expect(should_skip_turnstile_for_mobile(request)).toBe(true);
  });

  it("detects auto captcha done token from mobile body", () => {
    const request = mockRequest(
      { "x-explys-client": "mobile" },
      {
        clientType: "mobile",
        captchaToken: MOBILE_CAPTCHA_DONE_TOKEN,
      },
    );
    expect(has_mobile_captcha_done_token(request)).toBe(true);
    expect(should_skip_turnstile_for_mobile(request)).toBe(true);
  });

  it("rejects spoofed captcha done token without mobile signal", () => {
    const request = mockRequest(
      {},
      { captchaToken: MOBILE_CAPTCHA_DONE_TOKEN },
    );
    expect(has_mobile_captcha_done_token(request)).toBe(true);
    expect(has_mobile_client_signal(request)).toBe(false);
    expect(should_skip_turnstile_for_mobile(request)).toBe(false);
  });
});
