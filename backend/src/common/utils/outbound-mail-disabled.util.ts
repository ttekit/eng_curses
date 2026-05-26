import { ConfigService } from "@nestjs/config";

function resolveNodeEnv(configService: ConfigService): string {
  return (configService.get<string>("NODE_ENV") ?? process.env.NODE_ENV ?? "")
    .trim()
    .toLowerCase();
}

/** True when `NODE_ENV` is not `production` (e.g. local development). */
export function isNonProductionNodeEnv(configService: ConfigService): boolean {
  return resolveNodeEnv(configService) !== "production";
}

function isTruthyEnvFlag(configService: ConfigService, key: string): boolean {
  const raw = configService.get<string>(key);
  if (typeof raw !== "string") {
    return false;
  }
  const v = raw.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** True when `DEV_MODE` is `1`, `true`, or `yes` (matches frontend dev toggle). */
export function isDevModeEnabled(configService: ConfigService): boolean {
  return isTruthyEnvFlag(configService, "DEV_MODE");
}

/** True when `DISABLE_EMAIL` is `true`, `1`, or `yes` (case-insensitive). */
export function isOutboundMailDisabled(configService: ConfigService): boolean {
  return isTruthyEnvFlag(configService, "DISABLE_EMAIL");
}

/**
 * True when email verification should be skipped (auto-verify users, no confirm gate).
 * Enabled when `DEV_MODE=1` or outbound mail is disabled.
 */
export function isEmailConfirmationDisabled(
  configService: ConfigService,
): boolean {
  return (
    isDevModeEnabled(configService) ||
    isOutboundMailDisabled(configService)
  );
}
