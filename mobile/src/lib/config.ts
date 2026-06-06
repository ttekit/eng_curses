/**
 * Runtime configuration for the Explys React Native app.
 *
 * Values come from Expo `extra` (see `app.config.ts`) or `EXPO_PUBLIC_*` env vars.
 */
import Constants from "expo-constants";

type ExtraConfig = {
  apiBaseUrl?: string;
  apiToken?: string;
  apiBasicAuthUser?: string;
  apiBasicAuthPassword?: string;
  skipSubscriptionEnforcement?: string;
  turnstileSiteKey?: string;
  logApiErrors?: string;
};

function readExtra(): ExtraConfig {
  const extra = Constants.expoConfig?.extra;
  if (extra && typeof extra === "object") {
    return extra as ExtraConfig;
  }
  return {};
}

function readEnv(key: string): string {
  const fromProcess = process.env[key];
  if (typeof fromProcess === "string" && fromProcess.trim()) {
    return fromProcess.trim();
  }
  return "";
}

function readString(key: keyof ExtraConfig, envKey: string, fallback: string): string {
  const extra = readExtra();
  const fromExtra = extra[key];
  if (typeof fromExtra === "string" && fromExtra.trim()) {
    return fromExtra.trim();
  }
  const fromEnv = readEnv(envKey);
  if (fromEnv) {
    return fromEnv;
  }
  return fallback;
}

function readFlag(key: keyof ExtraConfig, envKey: string): boolean {
  const raw = readString(key, envKey, "0").toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

/** Nest API origin without trailing slash (e.g. `https://api.explys.com`). */
export function getApiBase(): string {
  return readString("apiBaseUrl", "EXPO_PUBLIC_API_BASE_URL", "https://api.explys.com").replace(
    /\/$/,
    "",
  );
}

export function getApiToken(): string | null {
  const token = readString("apiToken", "EXPO_PUBLIC_API_TOKEN", "");
  return token || null;
}

export function getBasicAuthCredentials(): { user: string; password: string } | null {
  const user = readString("apiBasicAuthUser", "EXPO_PUBLIC_API_BASIC_AUTH_USER", "");
  if (!user) {
    return null;
  }
  const password = readString("apiBasicAuthPassword", "EXPO_PUBLIC_API_BASIC_AUTH_PASSWORD", "");
  return { user, password };
}

export function subscriptionEnforcementDisabled(): boolean {
  return readFlag("skipSubscriptionEnforcement", "EXPO_PUBLIC_SKIP_SUBSCRIPTION_ENFORCEMENT");
}

export function getTurnstileSiteKey(): string {
  return readString(
    "turnstileSiteKey",
    "EXPO_PUBLIC_TURNSTILE_SITE_KEY",
    "0x4AAAAAADSk3etSiWLwGH5-",
  );
}

export function isApiErrorLoggingEnabled(): boolean {
  if (__DEV__) {
    return true;
  }
  return readFlag("logApiErrors", "EXPO_PUBLIC_LOG_API_ERRORS");
}
