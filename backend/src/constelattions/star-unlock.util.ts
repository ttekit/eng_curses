import { ProgressStatus } from "../generated/prisma/client";

export type StarUnlockNode = {
  readonly id: number;
  readonly prerequisiteIds: readonly number[];
};

/**
 * Resolves the single root star id from a constellation DAG.
 */
export function resolve_root_star_id(
  stars: readonly StarUnlockNode[],
): number | undefined {
  const roots = stars
    .filter((star) => star.prerequisiteIds.length === 0)
    .map((star) => star.id);
  if (!roots.length) {
    return stars[0]?.id;
  }
  return [...roots].sort((left, right) => left - right)[0];
}

/**
 * Returns true when every prerequisite star is completed.
 */
export function are_prerequisites_met(
  prerequisiteIds: readonly number[],
  completedStarIds: ReadonlySet<number>,
): boolean {
  return prerequisiteIds.every((id) => completedStarIds.has(id));
}

/**
 * Derives learner-visible status from stored progress and prerequisite completion.
 */
export function compute_effective_star_status(
  star: StarUnlockNode,
  storedStatus: ProgressStatus | undefined,
  completedStarIds: ReadonlySet<number>,
  rootStarId: number | undefined,
): ProgressStatus {
  if (storedStatus === ProgressStatus.COMPLETED) {
    return ProgressStatus.COMPLETED;
  }
  const prereqsMet = are_prerequisites_met(
    star.prerequisiteIds,
    completedStarIds,
  );
  if (storedStatus === ProgressStatus.IN_PROGRESS) {
    if (star.prerequisiteIds.length === 0 || prereqsMet) {
      return ProgressStatus.IN_PROGRESS;
    }
    return ProgressStatus.LOCKED;
  }
  if (star.prerequisiteIds.length === 0) {
    if (
      star.id === rootStarId &&
      storedStatus === ProgressStatus.AVAILABLE
    ) {
      return ProgressStatus.AVAILABLE;
    }
    return ProgressStatus.LOCKED;
  }
  if (!prereqsMet || storedStatus !== ProgressStatus.AVAILABLE) {
    return ProgressStatus.LOCKED;
  }
  return ProgressStatus.AVAILABLE;
}

/**
 * Finds stars that should unlock after prerequisite completion.
 */
export function find_stars_to_unlock(
  stars: readonly StarUnlockNode[],
  completedStarIds: ReadonlySet<number>,
  progressByStarId: ReadonlyMap<number, ProgressStatus>,
): number[] {
  return stars
    .filter((star) => {
      if (completedStarIds.has(star.id)) {
        return false;
      }
      if (star.prerequisiteIds.length === 0) {
        return false;
      }
      const current = progressByStarId.get(star.id);
      if (
        current === ProgressStatus.AVAILABLE ||
        current === ProgressStatus.IN_PROGRESS ||
        current === ProgressStatus.COMPLETED
      ) {
        return false;
      }
      return are_prerequisites_met(star.prerequisiteIds, completedStarIds);
    })
    .map((star) => star.id);
}
