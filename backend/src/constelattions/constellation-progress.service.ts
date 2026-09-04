import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ProgressStatus } from "../generated/prisma/client";

@Injectable()
export class ConstellationProgressService {
  constructor(private readonly prisma: PrismaService) { }

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
      include: { prerequisites: true },
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

    const newlyAvailable: number[] = [];

    for (const s of constellationStars) {
      if (completedStarIds.has(s.id)) continue;

      const progressRecord = userProgress.find((p) => p.starId === s.id);
      const currentStatus = progressRecord ? progressRecord.status : (s.prerequisites.length === 0 ? ProgressStatus.AVAILABLE : ProgressStatus.LOCKED);

      if (currentStatus === ProgressStatus.COMPLETED || currentStatus === ProgressStatus.IN_PROGRESS || currentStatus === ProgressStatus.AVAILABLE) {
        continue;
      }

      const allPrereqsMet = s.prerequisites.every((prereq) =>
        completedStarIds.has(prereq.prerequisiteId),
      );

      if (allPrereqsMet) {
        newlyAvailable.push(s.id);
      }
    }

    if (newlyAvailable.length > 0) {
      await this.prisma.$transaction(
        newlyAvailable.map((id) =>
          this.prisma.userStarProgress.upsert({
            where: { userId_starId: { userId, starId: id } },
            update: { status: ProgressStatus.AVAILABLE },
            create: { userId, starId: id, status: ProgressStatus.AVAILABLE },
          }),
        ),
      );
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
    });

    if (!stars.length) {
      throw new NotFoundException("Constellation empty or not found");
    }

    return stars.map((s) => {
      const defaultStatus =
        s.prerequisites.length === 0
          ? ProgressStatus.AVAILABLE
          : ProgressStatus.LOCKED;

      const status = s.userProgress[0]?.status || defaultStatus;

      const isHidden =
        status === ProgressStatus.LOCKED &&
        s.prerequisites.length > 0 &&
        s.prerequisites.every((p) => {
          const prereqStar = stars.find((st) => st.id === p.prerequisiteId);
          return (
            prereqStar?.userProgress[0]?.status !== ProgressStatus.COMPLETED
          );
        });

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        contentVideoId: s.contentVideoId,
        prerequisites: s.prerequisites.map((p) => p.prerequisiteId),
        progressStatus: status,
        isHidden,
      };
    });
  }
}