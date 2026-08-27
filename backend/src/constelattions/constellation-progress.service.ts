import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ProgressStatus } from "../generated/prisma/client";
import { StarContentGeneratorService } from "./star-content-generator.service";
import {
  compute_effective_star_status,
  find_stars_to_unlock,
  resolve_root_star_id,
} from "./star-unlock.util";

/**
 * Tracks star unlock progression within a constellation.
 */
@Injectable()
export class ConstellationProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly starContentGenerator: StarContentGeneratorService,
  ) {}

  async completeStar(userId: number, starId: number) {
    const star = await this.prisma.star.findUnique({
      where: { id: starId },
      include: { constellation: true },
    });

    if (!star) {
      throw new NotFoundException();
    }

    await this.prisma.userStarProgress.upsert({
      where: { userId_starId: { userId, starId } },
      update: { status: ProgressStatus.COMPLETED, completedAt: new Date() },
      create: {
        userId,
        starId,
        status: ProgressStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    const constellationStars = await this.prisma.star.findMany({
      where: { constellationId: star.constellationId },
      include: { prerequisites: { select: { prerequisiteId: true } } },
      orderBy: { id: "asc" },
    });

    const userProgress = await this.prisma.userStarProgress.findMany({
      where: { userId, star: { constellationId: star.constellationId } },
    });

    const completedStarIds = new Set(
      userProgress
        .filter((p) => p.status === ProgressStatus.COMPLETED)
        .map((p) => p.starId),
    );
    completedStarIds.add(starId);

    const unlockNodes = constellationStars.map((item) => ({
      id: item.id,
      prerequisiteIds: item.prerequisites.map(
        (prerequisite) => prerequisite.prerequisiteId,
      ),
    }));
    const progressByStarId = new Map(
      userProgress.map((record) => [record.starId, record.status]),
    );
    const newlyAvailable = find_stars_to_unlock(
      unlockNodes,
      completedStarIds,
      progressByStarId,
    );
    for (const unlockedStarId of newlyAvailable) {
      await this.prisma.userStarProgress.upsert({
        where: { userId_starId: { userId, starId: unlockedStarId } },
        update: { status: ProgressStatus.AVAILABLE },
        create: {
          userId,
          starId: unlockedStarId,
          status: ProgressStatus.AVAILABLE,
        },
      });
      this.starContentGenerator.schedule_star_content(unlockedStarId);
    }

    const allCompleted = constellationStars.every((s) =>
      completedStarIds.has(s.id),
    );

    if (allCompleted) {
      await this.prisma.userConstellationProgress.upsert({
        where: {
          userId_constellationId: {
            userId,
            constellationId: star.constellationId,
          },
        },
        update: { status: ProgressStatus.COMPLETED, completedAt: new Date() },
        create: {
          userId,
          constellationId: star.constellationId,
          status: ProgressStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    return {
      unlockedStars: newlyAvailable,
      constellationCompleted: allCompleted,
    };
  }

  async getOptimizedConstellationGraph(
    userId: number,
    constellationId: number,
  ) {
    const stars = await this.prisma.star.findMany({
      where: { constellationId },
      include: {
        prerequisites: { select: { prerequisiteId: true } },
        userProgress: { where: { userId } },
      },
      orderBy: { id: "asc" },
    });

    if (!stars.length) {
      throw new NotFoundException("Constellation empty or not found");
    }

    const unlockNodes = stars.map((item) => ({
      id: item.id,
      prerequisiteIds: item.prerequisites.map(
        (prerequisite) => prerequisite.prerequisiteId,
      ),
    }));
    const rootStarId = resolve_root_star_id(unlockNodes);
    const completedStarIds = new Set(
      stars
        .filter((item) => item.userProgress[0]?.status === ProgressStatus.COMPLETED)
        .map((item) => item.id),
    );

    return stars.map((s, index) => {
      const storedStatus = s.userProgress[0]?.status;
      const status = compute_effective_star_status(
        {
          id: s.id,
          prerequisiteIds: s.prerequisites.map(
            (prerequisite) => prerequisite.prerequisiteId,
          ),
        },
        storedStatus,
        completedStarIds,
        rootStarId,
      );
      const isHidden =
        status === ProgressStatus.LOCKED &&
        index > 0 &&
        stars[index - 1]?.userProgress[0]?.status !== ProgressStatus.COMPLETED;

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        contentVideoId: s.contentVideoId,
        type: s.type,
        metadata: s.metadata,
        prerequisites: s.prerequisites.map((p) => p.prerequisiteId),
        progressStatus: status,
        isHidden: !!isHidden,
      };
    });
  }
}
