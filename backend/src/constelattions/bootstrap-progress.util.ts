import type { PrismaService } from "src/prisma.service";

/**
 * Unlocks constellation + first root star for a learner.
 */
export async function bootstrap_constellation_progress(
  prisma: PrismaService,
  userId: number,
  constellationId: number,
  tempIdToDbId: Map<string, number>,
  prerequisitesData: { prerequisiteId: number; dependentId: number }[],
): Promise<void> {
  await prisma.userConstellationProgress
    .create({
      data: {
        userId,
        constellationId,
        status: "AVAILABLE",
      },
    })
    .catch(() => undefined);

  const dependentIds = new Set(prerequisitesData.map((p) => p.dependentId));
  const rootStarIds = Array.from(tempIdToDbId.values())
    .filter((id) => !dependentIds.has(id))
    .sort((left, right) => left - right);
  const firstStarId = rootStarIds[0] ?? Array.from(tempIdToDbId.values())[0];
  if (firstStarId) {
    await prisma.userStarProgress
      .create({
        data: {
          userId,
          starId: firstStarId,
          status: "AVAILABLE",
        },
      })
      .catch(() => undefined);
  }
}
