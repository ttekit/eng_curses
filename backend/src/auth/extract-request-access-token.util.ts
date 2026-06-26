import { Request } from "express";

/**
 * Extracts JWT from httpOnly cookie (primary), falling back to `Authorization: Bearer`
 * or `X-Access-Token` for reverse-proxy HTTP Basic Auth or admin scripts.
 */
export function extractAccessTokenFromRequest(
  request: Request,
): string | undefined {
  if (request.cookies && request.cookies["explys_access_token"]) {
    const cookieToken = request.cookies["explys_access_token"].trim();
    if (cookieToken) {
      return cookieToken;
    }
  }

  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    return token || undefined;
  }

  const alt = request.headers["x-access-token"];
  if (typeof alt === "string" && alt.trim()) {
    return alt.trim();
  }

  return undefined;
}
