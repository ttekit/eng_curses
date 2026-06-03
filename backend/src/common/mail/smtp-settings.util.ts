import { ConfigService } from "@nestjs/config";

export type ResolvedSmtpSettings = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly pass: string;
  readonly from: string;
};

function trimEnvValue(config: ConfigService, key: string): string {
  const raw = config.get<string>(key);
  if (typeof raw !== "string") {
    return "";
  }
  return raw.trim();
}

function isTruthyFlag(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/**
 * Resolves SMTP from `SMTP_*` environment variables.
 * Returns null when host or credentials are missing.
 */
export function resolveSmtpSettings(
  config: ConfigService,
): ResolvedSmtpSettings | null {
  const host = trimEnvValue(config, "SMTP_HOST");
  const user = trimEnvValue(config, "SMTP_USER");
  const pass = trimEnvValue(config, "SMTP_PASSWORD");
  if (!host || !user || !pass) {
    return null;
  }
  const portRaw = trimEnvValue(config, "SMTP_PORT");
  const port = portRaw ? Number(portRaw) : 587;
  const secureRaw = trimEnvValue(config, "SMTP_SECURE");
  const secure =
    isTruthyFlag(secureRaw) || (!secureRaw && port === 465);
  const from =
    trimEnvValue(config, "SMTP_FROM") ||
    '"Explys Support" <noreply@explys.com>';
  return { host, port, secure, user, pass, from };
}

/**
 * Nodemailer transport options for resolved SMTP settings.
 */
export function buildNodemailerTransportOptions(
  smtp: ResolvedSmtpSettings,
): Record<string, unknown> {
  return {
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: !smtp.secure && smtp.port === 587,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  };
}
