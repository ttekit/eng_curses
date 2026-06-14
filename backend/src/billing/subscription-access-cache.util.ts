import type { Redis } from "ioredis";

export const SUBSCRIPTION_ACCESS_CACHE_TTL_SEC = 60;

export type SubscriptionAccessCacheEntry = {
  role: string;
  teacherId: number | null;
  subscriptionStatus: string | null;
};

export function subscriptionAccessCacheKey(userId: number): string {
  return `sub:access:${userId}`;
}

export async function readSubscriptionAccessCache(
  redis: Redis,
  userId: number,
): Promise<SubscriptionAccessCacheEntry | null> {
  const raw = await redis.get(subscriptionAccessCacheKey(userId));
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as SubscriptionAccessCacheEntry).role !== "string"
    ) {
      return null;
    }
    const entry = parsed as SubscriptionAccessCacheEntry;
    return {
      role: entry.role,
      teacherId:
        typeof entry.teacherId === "number" ? entry.teacherId : null,
      subscriptionStatus:
        typeof entry.subscriptionStatus === "string" ?
          entry.subscriptionStatus
        : null,
    };
  } catch {
    return null;
  }
}

export async function writeSubscriptionAccessCache(
  redis: Redis,
  userId: number,
  entry: SubscriptionAccessCacheEntry,
): Promise<void> {
  await redis.set(
    subscriptionAccessCacheKey(userId),
    JSON.stringify(entry),
    "EX",
    SUBSCRIPTION_ACCESS_CACHE_TTL_SEC,
  );
}

export async function invalidateSubscriptionAccessCache(
  redis: Redis,
  userId: number,
): Promise<void> {
  await redis.del(subscriptionAccessCacheKey(userId));
}
