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

import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  it("should be defined", () => {
    expect(AuthController).toBeDefined();
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
