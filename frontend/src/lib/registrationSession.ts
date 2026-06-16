import {
  getStoredAccessToken,
  setStoredAccessToken,
} from "./api";

const SESSION_KEY = "exply_registration_session";

export type RegistrationSession = {
  accessToken: string;
  email: string;
  password: string;
};

function readRawSession(): RegistrationSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const row = parsed as Record<string, unknown>;
    const accessToken =
      typeof row.accessToken === "string" ? row.accessToken.trim() : "";
    const email = typeof row.email === "string" ? row.email.trim() : "";
    const password = typeof row.password === "string" ? row.password : "";
    if (!accessToken && !email && !password) {
      return null;
    }
    return { accessToken, email, password };
  } catch {
    return null;
  }
}

export function readRegistrationSession(): RegistrationSession | null {
  return readRawSession();
}

export function persistRegistrationSession(
  partial: Partial<RegistrationSession>,
): void {
  const prev = readRawSession();
  const next: RegistrationSession = {
    accessToken: partial.accessToken?.trim() || prev?.accessToken || "",
    email: partial.email?.trim() || prev?.email || "",
    password: partial.password ?? prev?.password ?? "",
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

export function clearRegistrationSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Rehydrates localStorage JWT from the in-flight registration session. */
export function restoreRegistrationAccessToken(): string | null {
  const stored = getStoredAccessToken();
  if (stored) {
    return stored;
  }
  const sessionToken = readRawSession()?.accessToken?.trim();
  if (!sessionToken) {
    return null;
  }
  setStoredAccessToken(sessionToken);
  return sessionToken;
}
