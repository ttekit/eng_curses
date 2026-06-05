/**
 * API client for the Explys mobile app (mirrors `frontend/src/lib/api.ts`).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encode as base64Encode } from "base-64";
import {
  getApiBase,
  getApiToken,
  getBasicAuthCredentials,
  isApiErrorLoggingEnabled,
} from "./config";

const ACCESS_TOKEN_KEY = "exply_access_token";

export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredAccessToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
}

type FetchOpts = RequestInit & { token?: string | null };

function apiPath(path: string): string {
  return getApiBase() + (path.startsWith("/") ? path : `/${path}`);
}

function encodeBasicAuthCredentials(username: string, password: string): string {
  return base64Encode(`${username}:${password}`);
}

export async function mergeApiAuthHeaders(
  base: HeadersInit | undefined,
  token?: string | null,
): Promise<Headers> {
  const headers = new Headers(base ?? {});
  let bearer: string | null | undefined;
  if (token === undefined) {
    bearer = await getStoredAccessToken();
  } else {
    bearer = token ?? null;
  }
  const basic = getBasicAuthCredentials();
  if (basic) {
    headers.set(
      "Authorization",
      `Basic ${encodeBasicAuthCredentials(basic.user, basic.password)}`,
    );
    if (bearer) {
      headers.set("X-Access-Token", bearer);
    }
  } else if (bearer) {
    headers.set("Authorization", `Bearer ${bearer}`);
  }
  const apiToken = getApiToken();
  if (apiToken) {
    headers.set("x-api-token", apiToken);
  }
  return headers;
}

export async function readApiErrorBody(res: Response): Promise<string> {
  const t = await res.text();
  if (!t) return `Request failed (${res.status})`;
  try {
    const j = JSON.parse(t) as { message?: string | string[]; error?: string };
    if (Array.isArray(j.message)) {
      return j.message.join("; ");
    }
    if (typeof j.message === "string" && j.message) {
      return j.message;
    }
    if (typeof j.error === "string" && j.error) {
      return j.error;
    }
  } catch {
    // not JSON
  }
  return t;
}

async function logFailedApiResponse(
  url: string,
  method: string,
  response: Response,
): Promise<void> {
  let bodyPreview: string;
  try {
    bodyPreview = await readApiErrorBody(response.clone());
  } catch {
    bodyPreview = "(unreadable body)";
  }
  console.error("[api]", method, url, `→ ${response.status} ${response.statusText}`, bodyPreview);
}

export async function apiFetch(path: string, init: FetchOpts = {}): Promise<Response> {
  const token = init.token ?? (await getStoredAccessToken());
  const { token: _ignored, ...rest } = init;
  const headers = await mergeApiAuthHeaders(rest.headers, token);
  if (
    rest.body != null &&
    typeof rest.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  const url = apiPath(path);
  const method = (rest.method ?? "GET").toUpperCase();
  try {
    const response = await fetch(url, { ...rest, headers });
    if (!response.ok && isApiErrorLoggingEnabled()) {
      await logFailedApiResponse(url, method, response);
    }
    return response;
  } catch (err) {
    if (isApiErrorLoggingEnabled()) {
      console.error("[api] request failed (network)", method, url, err);
    }
    throw err;
  }
}
