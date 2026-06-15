import { UnauthorizedException } from "@nestjs/common";

/** Reads numeric user id from Nest JWT payloads (`auth.service` signs `{ sub: number }`). */
export function jwtSubToUserId(user: unknown): number {
  if (!user || typeof user !== "object" || !("sub" in user)) {
    throw new UnauthorizedException("Invalid session");
  }
  const raw = (user as { sub: unknown }).sub;
  const n =
    typeof raw === "number" ? raw : parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new UnauthorizedException("Invalid session");
  }
  return Math.trunc(n);
}

/** Returns user id when present on `req.user`; otherwise `undefined` (no throw). */
export function optionalJwtSubToUserId(user: unknown): number | undefined {
  if (!user || typeof user !== "object" || !("sub" in user)) {
    return undefined;
  }
  const raw = (user as { sub: unknown }).sub;
  const n =
    typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) {
    return undefined;
  }
  return Math.trunc(n);
}

/**
 * Resolves user id from JWT payload that may use `sub` or legacy `id`.
 */
export function resolve_authed_user_id(user: unknown): number {
  if (!user || typeof user !== "object") {
    throw new UnauthorizedException("Invalid session");
  }
  const record = user as { sub?: unknown; id?: unknown };
  const raw = record.sub ?? record.id;
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new UnauthorizedException("Invalid session");
  }
  return Math.trunc(n);
}
