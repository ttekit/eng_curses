import { ConfigService } from "@nestjs/config";
import {
  buildNodemailerTransportOptions,
  resolveSmtpSettings,
} from "./smtp-settings.util";

function mockConfig(values: Record<string, string>): ConfigService {
  return {
    get: (key: string) => values[key],
  } as ConfigService;
}

describe("resolveSmtpSettings", () => {
  it("reads SMTP_* env vars", () => {
    const actual = resolveSmtpSettings(
      mockConfig({
        SMTP_HOST: "smtp.zeptomail.eu",
        SMTP_PORT: "587",
        SMTP_USER: "emailapikey",
        SMTP_PASSWORD: "secret",
        SMTP_FROM: "noreply@explys.com",
      }),
    );
    expect(actual?.host).toBe("smtp.zeptomail.eu");
    expect(actual?.from).toBe("noreply@explys.com");
  });

  it("returns null when credentials are incomplete", () => {
    expect(
      resolveSmtpSettings(mockConfig({ SMTP_HOST: "smtp.example.com" })),
    ).toBeNull();
  });
});

describe("buildNodemailerTransportOptions", () => {
  it("sets requireTLS on port 587", () => {
    const actual = buildNodemailerTransportOptions({
      host: "smtp.zeptomail.eu",
      port: 587,
      secure: false,
      user: "emailapikey",
      pass: "x",
      from: "a@b.com",
    });
    expect(actual.requireTLS).toBe(true);
    expect(actual.secure).toBe(false);
  });
});
