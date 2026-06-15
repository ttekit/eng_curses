import { ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TurnstileGuard } from "./turnstile.guard";
import { TurnstileService } from "../provider/turnstile.provider";
import { MOBILE_CAPTCHA_DONE_TOKEN } from "./mobile-client.util";

describe("TurnstileGuard", () => {
  const turnstileService = {
    validateToken: jest.fn(),
  } as unknown as TurnstileService;

  function createGuard(nodeEnv: string) {
    const configService = {
      get: jest.fn((key: string) => (key === "NODE_ENV" ? nodeEnv : undefined)),
    } as unknown as ConfigService;
    return new TurnstileGuard(turnstileService, configService);
  }

  function mockContext(
    headers: Record<string, string | string[]>,
    body?: object,
    headerFn?: (name: string) => string | undefined,
  ) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          header: headerFn ?? ((name: string) => {
            const value = headers[name.toLowerCase()];
            return Array.isArray(value) ? value[0] : value;
          }),
          body: body ?? {},
          ip: "127.0.0.1",
        }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("skips captcha outside production", async () => {
    const guard = createGuard("development");
    const actual = await guard.canActivate(mockContext({}));
    expect(actual).toBe(true);
    expect(turnstileService.validateToken).not.toHaveBeenCalled();
  });

  it("skips captcha for mobile client header in production", async () => {
    const guard = createGuard("production");
    const actual = await guard.canActivate(
      mockContext({ "x-explys-client": "mobile" }),
    );
    expect(actual).toBe(true);
    expect(turnstileService.validateToken).not.toHaveBeenCalled();
  });

  it("skips captcha for mobile clientType in production", async () => {
    const guard = createGuard("production");
    const actual = await guard.canActivate(
      mockContext({}, { clientType: "mobile" }),
    );
    expect(actual).toBe(true);
    expect(turnstileService.validateToken).not.toHaveBeenCalled();
  });

  it("skips captcha for mobile auto-done token in production", async () => {
    const guard = createGuard("production");
    const actual = await guard.canActivate(
      mockContext(
        { "x-explys-client": "mobile" },
        {
          clientType: "mobile",
          captchaToken: MOBILE_CAPTCHA_DONE_TOKEN,
        },
      ),
    );
    expect(actual).toBe(true);
    expect(turnstileService.validateToken).not.toHaveBeenCalled();
  });

  it("requires captcha for web clients in production", async () => {
    const guard = createGuard("production");
    await expect(guard.canActivate(mockContext({}))).rejects.toThrow(
      "CAPTCHA is required",
    );
  });
});
