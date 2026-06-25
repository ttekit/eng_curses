import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isFirstPartyPosthogHost,
  probePosthogReachability,
  resolvePosthogAssetsHost,
} from "./posthogReachability";

function stubBrowserTimers(): void {
  vi.stubGlobal("window", {
    setTimeout: (callback: () => void) => globalThis.setTimeout(callback, 0),
    clearTimeout: (timeoutId: ReturnType<typeof setTimeout>) =>
      globalThis.clearTimeout(timeoutId),
  });
}

describe("resolvePosthogAssetsHost", () => {
  it("maps EU API host to EU assets host", () => {
    expect(resolvePosthogAssetsHost("https://eu.i.posthog.com")).toBe(
      "https://eu-assets.i.posthog.com",
    );
  });

  it("maps US API host to US assets host", () => {
    expect(resolvePosthogAssetsHost("https://us.i.posthog.com")).toBe(
      "https://us-assets.i.posthog.com",
    );
  });

  it("keeps first-party proxy paths unchanged", () => {
    expect(resolvePosthogAssetsHost("/ingest")).toBe("/ingest");
  });
});

describe("isFirstPartyPosthogHost", () => {
  it("detects relative ingest paths", () => {
    expect(isFirstPartyPosthogHost("/ingest")).toBe(true);
    expect(isFirstPartyPosthogHost("https://eu.i.posthog.com")).toBe(false);
  });
});

describe("probePosthogReachability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("skips probing for first-party hosts", async () => {
    await expect(probePosthogReachability("/ingest")).resolves.toBe(true);
  });

  it("returns false when the probe image fails", async () => {
    stubBrowserTimers();
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", MockImage);
    await expect(
      probePosthogReachability("https://eu.i.posthog.com"),
    ).resolves.toBe(false);
  });

  it("returns true when the probe image loads", async () => {
    stubBrowserTimers();
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", MockImage);
    await expect(
      probePosthogReachability("https://eu.i.posthog.com"),
    ).resolves.toBe(true);
  });
});
