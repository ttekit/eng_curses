import { describe, expect, it } from "vitest";
import { parseAccessTokenFromAuthResponse } from "./authTokenResponse";

describe("parseAccessTokenFromAuthResponse", () => {
  it("reads snake_case access_token", () => {
    expect(parseAccessTokenFromAuthResponse({ access_token: "jwt-1" })).toBe(
      "jwt-1",
    );
  });

  it("reads camelCase accessToken", () => {
    expect(parseAccessTokenFromAuthResponse({ accessToken: "jwt-2" })).toBe(
      "jwt-2",
    );
  });

  it("reads nested data.access_token", () => {
    expect(
      parseAccessTokenFromAuthResponse({ data: { access_token: "jwt-3" } }),
    ).toBe("jwt-3");
  });

  it("returns null for empty payloads", () => {
    expect(parseAccessTokenFromAuthResponse(null)).toBeNull();
    expect(parseAccessTokenFromAuthResponse({})).toBeNull();
  });
});
