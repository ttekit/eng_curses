import { getApiBase } from "./api";

/**
 * Origins allowed to deliver iframe postMessage events to the SPA.
 */
export function isTrustedIframeMessageOrigin(origin: string): boolean {
  if (!origin) {
    return false;
  }
  const allowed = new Set<string>();
  allowed.add(window.location.origin);
  try {
    const apiBase = getApiBase();
    if (apiBase.startsWith("http")) {
      allowed.add(new URL(apiBase).origin);
    }
  } catch {
    /* ignore */
  }
  const extra = import.meta.env.VITE_TRUSTED_MESSAGE_ORIGINS ?? "";
  for (const part of extra.split(",")) {
    const t = part.trim();
    if (t) {
      allowed.add(t);
    }
  }
  return allowed.has(origin);
}
