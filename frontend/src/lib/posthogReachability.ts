const PROBE_TIMEOUT_MS = 2500;
const PROBE_ASSET_PATH = "/static/exception-autocapture.js?v=1";

export function resolvePosthogAssetsHost(apiHost: string): string {
  const normalized = apiHost.trim().replace(/\/$/, "");
  if (normalized.startsWith("/")) {
    return normalized;
  }
  if (
    normalized.includes("eu.i.posthog.com") ||
    normalized.includes("eu.posthog.com")
  ) {
    return "https://eu-assets.i.posthog.com";
  }
  return "https://us-assets.i.posthog.com";
}

export function isFirstPartyPosthogHost(apiHost: string): boolean {
  return apiHost.trim().startsWith("/");
}

export function probePosthogReachability(apiHost: string): Promise<boolean> {
  if (isFirstPartyPosthogHost(apiHost)) {
    return Promise.resolve(true);
  }
  const assetsHost = resolvePosthogAssetsHost(apiHost);
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => resolve(false), PROBE_TIMEOUT_MS);
    const image = new Image();
    image.onload = () => {
      window.clearTimeout(timeoutId);
      resolve(true);
    };
    image.onerror = () => {
      window.clearTimeout(timeoutId);
      resolve(false);
    };
    image.src = `${assetsHost}${PROBE_ASSET_PATH}&t=${Date.now()}`;
  });
}
