import {
  apiFetch,
  readApiErrorBody,
  setStoredAccessToken,
} from "./api";
import { parseAccessTokenFromAuthResponse } from "./authTokenResponse";
import {
  persistRegistrationSession,
  readRegistrationSession,
  restoreRegistrationAccessToken,
} from "./registrationSession";

export type EnsureRegistrationAccessTokenParams = {
  email: string;
  password: string;
  captchaToken?: string | null;
};

export type EnsureRegistrationAccessTokenResult =
  | { ok: true; token: string }
  | {
      ok: false;
      reason: "missing_credentials" | "captcha_required" | "login_failed";
      message?: string;
    };

/**
 * Returns a JWT for the in-progress registration flow.
 * Reuses stored/session tokens or signs in with step-1 credentials (fresh CAPTCHA in prod).
 */
export async function ensureRegistrationAccessToken(
  params: EnsureRegistrationAccessTokenParams,
): Promise<EnsureRegistrationAccessTokenResult> {
  const existing = restoreRegistrationAccessToken();
  if (existing) {
    return { ok: true, token: existing };
  }

  const session = readRegistrationSession();
  const email = params.email.trim() || session?.email.trim() || "";
  const password = params.password || session?.password || "";
  if (!email || !password) {
    return { ok: false, reason: "missing_credentials" };
  }

  if (!params.captchaToken?.trim()) {
    return { ok: false, reason: "captcha_required" };
  }

  const body: Record<string, string> = {
    email,
    password,
    captchaToken: params.captchaToken.trim(),
  };

  let response: Response;
  try {
    response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, reason: "login_failed" };
  }

  if (!response.ok) {
    const message = await readApiErrorBody(response);
    return { ok: false, reason: "login_failed", message };
  }

  try {
    const data: unknown = await response.json();
    const record =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null;
    if (record?.requiresTwoFactor === true) {
      return {
        ok: false,
        reason: "login_failed",
        message: "Two-factor authentication is required for this account.",
      };
    }
    const token = parseAccessTokenFromAuthResponse(data);
    if (token) {
      setStoredAccessToken(token);
      persistRegistrationSession({ accessToken: token, email, password });
      return { ok: true, token };
    }
  } catch {
    return { ok: false, reason: "login_failed" };
  }

  return { ok: false, reason: "login_failed" };
}
