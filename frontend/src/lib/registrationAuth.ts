import {
  apiFetch,
  getStoredAccessToken,
  readApiErrorBody,
  setStoredAccessToken,
} from "./api";

type EnsureRegistrationAccessTokenParams = {
  email: string;
  password: string;
  captchaToken?: string | null;
};

/**
 * Returns a JWT for the in-progress registration flow.
 * Reuses a stored token or signs in with step-1 credentials when the session was lost.
 */
export async function ensureRegistrationAccessToken(
  params: EnsureRegistrationAccessTokenParams,
): Promise<string | null> {
  const existing = getStoredAccessToken();
  if (existing) {
    return existing;
  }

  const email = params.email.trim();
  if (!email || !params.password) {
    return null;
  }

  const body: Record<string, string> = {
    email,
    password: params.password,
  };
  if (params.captchaToken) {
    body.captchaToken = params.captchaToken;
  }

  let response: Response;
  try {
    response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    await readApiErrorBody(response);
    return null;
  }

  try {
    const data = (await response.json()) as {
      access_token?: string;
      requiresTwoFactor?: boolean;
    };
    if (data.requiresTwoFactor) {
      return null;
    }
    if (typeof data.access_token === "string" && data.access_token.length > 0) {
      setStoredAccessToken(data.access_token);
      return data.access_token;
    }
  } catch {
    return null;
  }

  return null;
}
