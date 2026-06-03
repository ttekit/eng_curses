import { ConfigService } from "@nestjs/config";

/**
 * Resolves CSP `frame-ancestors` for test iframes.
 * Production without explicit config uses `'self'` instead of `*`.
 */
export function resolveFrameAncestorsCsp(
  config: ConfigService,
  envKey: "COMPREHENSION_TEST_FRAME_ANCESTORS" | "PLACEMENT_TEST_FRAME_ANCESTORS",
): string {
  const explicit = config.get<string>(envKey)?.trim();
  if (explicit) {
    return explicit;
  }
  const nodeEnv = (config.get<string>("NODE_ENV") ?? process.env.NODE_ENV ?? "")
    .trim()
    .toLowerCase();
  if (nodeEnv === "production") {
    const frontend = config.get<string>("FRONTEND_ORIGIN")?.trim();
    if (frontend) {
      return `'self' ${frontend}`;
    }
    return "'self'";
  }
  return "*";
}
