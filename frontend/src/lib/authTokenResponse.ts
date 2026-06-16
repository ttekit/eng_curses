/** Reads JWT from auth API bodies (`access_token`, `accessToken`, or nested `data`). */
export function parseAccessTokenFromAuthResponse(
  data: unknown,
): string | null {
  const direct = parseAccessTokenRecord(data);
  if (direct) {
    return direct;
  }
  if (!data || typeof data !== "object") {
    return null;
  }
  const nested = (data as Record<string, unknown>).data;
  return parseAccessTokenRecord(nested);
}

function parseAccessTokenRecord(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as Record<string, unknown>;
  const snake = record.access_token;
  if (typeof snake === "string" && snake.trim().length > 0) {
    return snake.trim();
  }
  const camel = record.accessToken;
  if (typeof camel === "string" && camel.trim().length > 0) {
    return camel.trim();
  }
  return null;
}
