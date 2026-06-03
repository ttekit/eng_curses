import { ConfigService } from "@nestjs/config";

/**
 * Target origin for iframe `postMessage` to the parent SPA.
 */
export function resolveParentPostMessageOrigin(config: ConfigService): string {
  const explicit = config.get<string>("FRONTEND_ORIGIN")?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const cancel = config.get<string>("STRIPE_CHECKOUT_CANCEL_URL")?.trim();
  if (cancel) {
    try {
      return new URL(cancel).origin;
    } catch {
      /* ignore */
    }
  }
  return "";
}
