/**
 * Deterministic pseudo-random values for SSR-safe decorative layouts.
 */
export function seeded_random(index: number, salt: number): number {
  const value = Math.sin(index * 999.13 + salt) * 10000;
  return value - Math.floor(value);
}
