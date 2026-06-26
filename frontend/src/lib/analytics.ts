import type { PostHog } from "posthog-js";
import {
  isFirstPartyPosthogHost,
  probePosthogReachability,
} from "./posthogReachability";

const GA_MEASUREMENT_ID = "G-KSFKZHGKTC";

let posthogClient: PostHog | null = null;
let bootstrapPromise: Promise<PostHog | null> | null = null;

function readPosthogKey(): string | null {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (typeof key !== "string" || !key.trim()) {
    return null;
  }
  return key.trim();
}

function readPosthogHost(): string {
  return (
    import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() ??
    "https://us.i.posthog.com"
  );
}

function captureGooglePageView(pathname: string): void {
  if (typeof window.gtag !== "function") {
    return;
  }
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: pathname });
}

async function bootstrapPosthog(): Promise<PostHog | null> {
  if (posthogClient) {
    return posthogClient;
  }
  const key = readPosthogKey();
  if (!key) {
    return null;
  }
  const apiHost = readPosthogHost();
  if (!isFirstPartyPosthogHost(apiHost)) {
    const isReachable = await probePosthogReachability(apiHost);
    if (!isReachable) {
      return null;
    }
  }
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.init(key, {
      api_host: apiHost,
      advanced_disable_feature_flags: true,
      persistence: "localStorage+cookie",
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
    posthogClient = posthog;
    return posthog;
  } catch {
    return null;
  }
}

function ensurePosthogBootstrap(): Promise<PostHog | null> {
  bootstrapPromise ??= bootstrapPosthog();
  return bootstrapPromise;
}

async function withPosthog(
  run: (client: PostHog) => void,
): Promise<void> {
  const client = await ensurePosthogBootstrap();
  if (!client) {
    return;
  }
  try {
    run(client);
  } catch {
    // Analytics must never break the app or pollute the console.
  }
}

export function initPosthog(): Promise<void> {
  return ensurePosthogBootstrap().then(() => undefined);
}

export function capturePageView(pathname: string): void {
  captureGooglePageView(pathname);
  if (!readPosthogKey()) {
    return;
  }
  void withPosthog((client) => {
    client.capture("$pageview", { path: pathname });
  });
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (!readPosthogKey()) {
    return;
  }
  void withPosthog((client) => {
    client.capture(event, properties);
  });
}

export function identifyLearner(
  distinctId: string,
  traits?: Record<string, unknown>,
): void {
  if (!readPosthogKey()) {
    return;
  }
  void withPosthog((client) => {
    client.identify(distinctId, traits);
  });
}

export function resetAnalytics(): void {
  if (!posthogClient) {
    return;
  }
  try {
    posthogClient.reset();
  } catch {
    // Ignore reset failures when analytics is unavailable.
  }
}
