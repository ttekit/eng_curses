export const MOBILE_CLIENT_HEADER = "x-explys-client";
export const MOBILE_CLIENT_TYPE = "mobile";
export const MOBILE_CAPTCHA_DONE_TOKEN = "explys-mobile-captcha-done";

type RequestHeaders = Record<string, string | string[] | undefined>;

type MobileClientRequest = {
  header: (name: string) => string | undefined;
  headers: RequestHeaders;
  body?: { clientType?: unknown; captchaToken?: unknown };
};

function read_mobile_client_header(
  request: MobileClientRequest,
): string | string[] | undefined {
  const fromGetter = request.header(MOBILE_CLIENT_HEADER);
  if (fromGetter) {
    return fromGetter;
  }
  return request.headers[MOBILE_CLIENT_HEADER];
}

function matches_mobile_client_value(value: string): boolean {
  return value.toLowerCase() === MOBILE_CLIENT_TYPE;
}

function has_mobile_client_header(request: MobileClientRequest): boolean {
  const headerValue = read_mobile_client_header(request);
  if (typeof headerValue === "string") {
    return matches_mobile_client_value(headerValue);
  }
  if (Array.isArray(headerValue)) {
    return headerValue.some((value) => matches_mobile_client_value(value));
  }
  return false;
}

function has_mobile_client_type(request: MobileClientRequest): boolean {
  const clientType = request.body?.clientType;
  return typeof clientType === "string" && matches_mobile_client_value(clientType);
}

export function has_mobile_client_signal(request: MobileClientRequest): boolean {
  return has_mobile_client_header(request) || has_mobile_client_type(request);
}

export function has_mobile_captcha_done_token(request: MobileClientRequest): boolean {
  const captchaToken = request.body?.captchaToken;
  return (
    typeof captchaToken === "string" && captchaToken === MOBILE_CAPTCHA_DONE_TOKEN
  );
}

/** Native mobile clients are treated as captcha-complete once identified. */
export function should_skip_turnstile_for_mobile(
  request: MobileClientRequest,
): boolean {
  if (!has_mobile_client_signal(request)) {
    return false;
  }
  return true;
}

export function is_mobile_explys_client(headers: RequestHeaders): boolean {
  const raw = headers[MOBILE_CLIENT_HEADER];
  if (typeof raw === "string") {
    return matches_mobile_client_value(raw);
  }
  if (Array.isArray(raw)) {
    return raw.some((value) => matches_mobile_client_value(value));
  }
  return false;
}
