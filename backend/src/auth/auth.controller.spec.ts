import "reflect-metadata";
import {
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from "@nestjs/throttler/dist/throttler.constants";

jest.mock("./auth.service", () => ({
  AuthService: class MockAuthService {},
}));
jest.mock("src/users/users.service", () => ({
  UsersService: class MockUsersService {},
}));
jest.mock("src/common/mail/mail.service", () => ({
  MailService: class MockMailService {},
}));

import { Reflector } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";

describe("AuthController", () => {
  it("should be defined", () => {
    expect(AuthController).toBeDefined();
  });

  describe("public auth routes", () => {
    const reflector = new Reflector();

    it("marks the browser-facing auth endpoints as public", () => {
      const publicRoutes = [
        "register",
        "login",
        "verifyEmail",
        "resendConfirmation",
        "confirmEmail",
        "verifyTwoFactorLogin",
        "callback",
        "connect",
      ] as const;

      for (const routeName of publicRoutes) {
        const handler = AuthController.prototype[routeName] as unknown;

        expect(typeof handler).toBe("function");
        expect(
          reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            handler as never,
            AuthController,
          ]),
        ).toBe(true);
      }
    });
  });

  describe("auth rate limits", () => {
    const throttledMethods = [
      "login",
      "verifyEmail",
      "resendConfirmation",
      "verifyTwoFactorLogin",
    ] as const;

    it.each(throttledMethods)(
      "applies @Throttle(auth) on %s",
      (methodName) => {
        const handler = AuthController.prototype[methodName] as object;
        expect(typeof handler).toBe("function");
        expect(Reflect.getMetadata(THROTTLER_LIMIT + "auth", handler)).toBe(10);
        expect(Reflect.getMetadata(THROTTLER_TTL + "auth", handler)).toBe(
          60_000,
        );
      },
    );
  });
});
