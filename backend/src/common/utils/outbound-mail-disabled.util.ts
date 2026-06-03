import { ConfigService } from "@nestjs/config";

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

/**
 * Outbound SMTP is enabled unless `DISABLE_EMAIL=true`.
 * Do not gate mail on NODE_ENV or DEV_MODE — use DISABLE_EMAIL only.
 */
export function isOutboundMailDisabled(configService: ConfigService): boolean {
  return isTruthyEnvFlag(configService, "DISABLE_EMAIL");
}

/**
 * Email verification gate skipped when `DEV_MODE=1` only (not when mail is off).
 */
export function isEmailConfirmationDisabled(
  configService: ConfigService,
): boolean {
  return isDevModeEnabled(configService);
}
