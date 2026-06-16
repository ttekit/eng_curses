/** Reads JWT from auth API bodies (`access_token` or `accessToken`). */
export function parseAccessTokenFromAuthResponse(
  data: unknown,
): string | null {
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
