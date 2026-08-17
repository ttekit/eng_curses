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
      orderBy: { id: 'asc' },
    });

    const userProgress = await this.prisma.userStarProgress.findMany({
      where: { userId, star: { constellationId: star.constellationId } },
    });

    const completedStarIds = new Set(
      userProgress
        .filter((p) => p.status === ProgressStatus.COMPLETED)
        .map((p) => p.starId),
    );

    // Добавляем ту, которую только что прошли
    completedStarIds.add(starId);

    const newlyAvailable: number[] = [];

    const nextStar = constellationStars.find((s) => !completedStarIds.has(s.id));

    if (nextStar) {
      const progressRecord = userProgress.find((p) => p.starId === nextStar.id);
      const currentStatus = progressRecord ? progressRecord.status : ProgressStatus.LOCKED;

      if (currentStatus === ProgressStatus.LOCKED) {
        newlyAvailable.push(nextStar.id);

        await this.prisma.userStarProgress.upsert({
          where: { userId_starId: { userId, starId: nextStar.id } },
          update: { status: ProgressStatus.AVAILABLE },
          create: { userId, starId: nextStar.id, status: ProgressStatus.AVAILABLE },
        });
      }
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
    // Сортируем выдачу графа на фронт тоже строго по ID
    const stars = await this.prisma.star.findMany({
      where: { constellationId },
      include: {
        prerequisites: { select: { prerequisiteId: true } },
        userProgress: { where: { userId } },
      },
      orderBy: { id: 'asc' },
    });

    if (!stars.length) {
      throw new NotFoundException("Constellation empty or not found");
    }

    return stars.map((s, index) => {
      // По умолчанию открыта только самая первая звезда (index === 0), остальные закрыты
      const defaultStatus = index === 0 ? ProgressStatus.AVAILABLE : ProgressStatus.LOCKED;
      const status = s.userProgress[0]?.status || defaultStatus;

      // Звезда скрыта, если она заблокирована и предыдущая звезда еще не пройдена
      const isHidden =
        status === ProgressStatus.LOCKED &&
        index > 0 &&
        stars[index - 1].userProgress[0]?.status !== ProgressStatus.COMPLETED;

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