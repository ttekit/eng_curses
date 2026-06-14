import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { SKIP_SUBSCRIPTION_CHECK_KEY } from "../decorators/skip-subscription-check.decorator";
import { RequireActiveSubscriptionGuard } from "./require-active-subscription.guard";

describe("RequireActiveSubscriptionGuard", () => {
  const reflector = new Reflector();
  const jwt = { verifyAsync: jest.fn() } as unknown as JwtService;
  const prisma = { user: { findUnique: jest.fn() } };
  const config = {
    get: jest.fn((key: string) => {
      if (key === "NODE_ENV") return "production";
      if (key === "JWT_SECRET") return "test-secret";
      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === "JWT_SECRET") return "test-secret";
      throw new Error(`missing ${key}`);
    }),
  } as unknown as ConfigService;

  const redis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    del: jest.fn().mockResolvedValue(1),
  };

  const guard = new RequireActiveSubscriptionGuard(
    config,
    jwt,
    prisma as never,
    reflector,
    redis as never,
  );

  function mockContext(handlerMeta?: boolean): ExecutionContext {
    const handler = jest.fn();
    if (handlerMeta) {
      Reflect.defineMetadata(SKIP_SUBSCRIPTION_CHECK_KEY, true, handler);
    }
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method: "GET",
          path: "/content-video",
          headers: {},
        }),
      }),
      getHandler: () => handler,
      getClass: () => class MockHandler {},
    } as unknown as ExecutionContext;
  }

  it("allows routes marked with SkipSubscriptionCheck without a JWT", async () => {
    const actual = await guard.canActivate(mockContext(true));
    expect(actual).toBe(true);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });
});
