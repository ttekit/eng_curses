import { ConfigService } from "@nestjs/config";
import {
  isEmailConfirmationDisabled,
  isOutboundMailDisabled,
} from "./outbound-mail-disabled.util";

function mockConfig(values: Record<string, string>): ConfigService {
  return {
    get: (key: string) => values[key],
  } as ConfigService;
}

describe("isOutboundMailDisabled", () => {
  it("sends mail in development when DISABLE_EMAIL is not set", () => {
    expect(
      isOutboundMailDisabled(mockConfig({ NODE_ENV: "development" })),
    ).toBe(false);
  });

  it("disables mail only when DISABLE_EMAIL=true", () => {
    expect(
      isOutboundMailDisabled(
        mockConfig({ NODE_ENV: "development", DISABLE_EMAIL: "true" }),
      ),
    ).toBe(true);
  });

  it("does not disable mail when DEV_MODE=1", () => {
    expect(
      isOutboundMailDisabled(
        mockConfig({ NODE_ENV: "development", DEV_MODE: "1" }),
      ),
    ).toBe(false);
  });
});

describe("isEmailConfirmationDisabled", () => {
  it("is true when DEV_MODE=1", () => {
    expect(isEmailConfirmationDisabled(mockConfig({ DEV_MODE: "1" }))).toBe(
      true,
    );
  });

  it("is false when DEV_MODE is off", () => {
    expect(isEmailConfirmationDisabled(mockConfig({ DEV_MODE: "0" }))).toBe(
      false,
    );
  });
});
