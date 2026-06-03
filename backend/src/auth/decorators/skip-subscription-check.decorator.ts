import { SetMetadata } from "@nestjs/common";

export const SKIP_SUBSCRIPTION_CHECK_KEY = "skipSubscriptionCheck";

/**
 * Bypass production subscription enforcement for this handler or controller.
 * API token and route JWT guards still apply.
 */
export const SkipSubscriptionCheck = () =>
  SetMetadata(SKIP_SUBSCRIPTION_CHECK_KEY, true);
