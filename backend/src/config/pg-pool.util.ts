export function resolvePgPoolMax(): number {
  const raw = process.env.PG_POOL_MAX?.trim();
  if (!raw) {
    return 10;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 10;
  }
  return Math.trunc(parsed);
}
