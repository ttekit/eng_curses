/**
 * Subset of Redis commands used for catalog video caching.
 */
export interface RedisCatalogCacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<"OK">;
  del(key: string): Promise<number>;
}

type CacheEntry = {
  value: string;
  expiresAt?: number;
};

/**
 * Minimal Redis-compatible client for local dev when Redis is not running.
 * Supports get / set (with EX ttl) / del used by catalog video caching.
 */
export function createInMemoryRedisClient(): RedisCatalogCacheClient {
  const store = new Map<string, CacheEntry>();
  return {
    get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) {
        return Promise.resolve(null);
      }
      if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
        store.delete(key);
        return Promise.resolve(null);
      }
      return Promise.resolve(entry.value);
    },
    set(key: string, value: string, ...args: unknown[]): Promise<"OK"> {
      let ttlSeconds: number | undefined;
      const exIndex = args.indexOf("EX");
      if (exIndex >= 0 && typeof args[exIndex + 1] === "number") {
        ttlSeconds = args[exIndex + 1] as number;
      }
      store.set(key, {
        value,
        expiresAt:
          ttlSeconds !== undefined
            ? Date.now() + ttlSeconds * 1000
            : undefined,
      });
      return Promise.resolve("OK");
    },
    del(key: string): Promise<number> {
      return Promise.resolve(store.delete(key) ? 1 : 0);
    },
  };
}
