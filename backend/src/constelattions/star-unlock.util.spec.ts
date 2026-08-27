import { ProgressStatus } from "../generated/prisma/client";
import {
  compute_effective_star_status,
  find_stars_to_unlock,
  resolve_root_star_id,
} from "./star-unlock.util";

describe("star-unlock.util", () => {
  const stars = [
    { id: 1, prerequisiteIds: [] as number[] },
    { id: 2, prerequisiteIds: [1] },
    { id: 8, prerequisiteIds: [7] },
  ];

  it("resolves the lowest-id root star", () => {
    expect(resolve_root_star_id(stars)).toBe(1);
  });

  it("keeps only the bootstrapped root available", () => {
    const completed = new Set<number>();
    expect(
      compute_effective_star_status(
        stars[0],
        ProgressStatus.AVAILABLE,
        completed,
        1,
      ),
    ).toBe(ProgressStatus.AVAILABLE);
    expect(
      compute_effective_star_status(
        stars[2],
        ProgressStatus.AVAILABLE,
        completed,
        1,
      ),
    ).toBe(ProgressStatus.LOCKED);
  });

  it("unlocks stars only when prerequisites are completed", () => {
    const completed = new Set([1]);
    const progress = new Map<number, ProgressStatus>([
      [1, ProgressStatus.COMPLETED],
      [2, ProgressStatus.LOCKED],
    ]);
    expect(find_stars_to_unlock(stars, completed, progress)).toEqual([2]);
  });
});
