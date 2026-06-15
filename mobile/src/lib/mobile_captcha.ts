/**
 * Marks JSON auth bodies as native mobile clients.
 * Does not inject captcha tokens — production requires real Turnstile tokens.
 */
export const MOBILE_CLIENT_TYPE = "mobile";

export function attach_mobile_auth_fields(
  body: BodyInit | null | undefined,
): BodyInit | null | undefined {
  if (body == null || typeof body !== "string") {
    return body;
  }
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    if (parsed.clientType === MOBILE_CLIENT_TYPE) {
      return body;
    }
    return JSON.stringify({
      ...parsed,
      clientType: MOBILE_CLIENT_TYPE,
    });
  } catch {
    return body;
  }
}
