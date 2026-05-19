import { createHmac, timingSafeEqual } from "node:crypto";
import type { GradingItem } from "src/content-video/content-video-test-grade.util";

export type RecapKind = "mistakes" | "weekly" | "monthly";

export type ParsedRecapGradingPayload = {
  v: 1;
  kind: RecapKind;
  exp: number;
  userId: number;
  items: GradingItem[];
};

const enc = (b: Buffer) => b.toString("base64url");
const dec = (s: string) => Buffer.from(s, "base64url");

export function createRecapGradingToken(
  payload: Omit<ParsedRecapGradingPayload, "v">,
  secret: string,
): string {
  const body: ParsedRecapGradingPayload = { v: 1, ...payload };
  const json = JSON.stringify(body);
  const b = Buffer.from(json, "utf8");
  const mac = createHmac("sha256", secret).update(b).digest();
  return `${enc(b)}.${enc(mac)}`;
}

export function parseRecapGradingToken(
  token: string,
  secret: string,
): ParsedRecapGradingPayload | null {
  const parts = (token ?? "").split(".");
  if (parts.length !== 2) {
    return null;
  }
  let data: Buffer;
  let mac: Buffer;
  try {
    data = dec(parts[0]);
    mac = dec(parts[1]);
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret).update(data).digest();
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(data.toString("utf8"));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const p = parsed as Partial<ParsedRecapGradingPayload>;
  if (p.v !== 1) {
    return null;
  }
  if (typeof p.exp !== "number" || Date.now() > p.exp) {
    return null;
  }
  if (
    p.kind !== "mistakes" &&
    p.kind !== "weekly" &&
    p.kind !== "monthly"
  ) {
    return null;
  }
  if (typeof p.userId !== "number" || !Array.isArray(p.items)) {
    return null;
  }
  const items: GradingItem[] = [];
  for (const raw of p.items) {
    if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
      return null;
    }
    const it = raw as Record<string, unknown>;
    if (it.kind !== "mcq") {
      return null;
    }
    if (
      typeof it.id !== "string" ||
      typeof it.correctIndex !== "number" ||
      (it.category !== "grammar" &&
        it.category !== "vocabulary" &&
        it.category !== "comprehension")
    ) {
      return null;
    }
    items.push({
      kind: "mcq",
      id: it.id,
      correctIndex: Math.floor(it.correctIndex),
      category: it.category,
      questionStem:
        typeof it.questionStem === "string" ? it.questionStem : undefined,
    });
  }
  if (items.length === 0) {
    return null;
  }
  return {
    v: 1,
    kind: p.kind,
    exp: p.exp,
    userId: p.userId,
    items,
  };
}
