import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/prisma.service";
import { Redis } from "ioredis";

@Injectable()
export class ContentsDeadlineCron {
  private readonly logger = new Logger(ContentsDeadlineCron.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleVideoDeadlines() {
    const now = new Date();

    try {
      const toOpen = await this.prisma.content.updateMany({
        where: {
          availableFrom: { lte: now },
          visibility: "unlisted",
          OR: [{ deadline: null }, { deadline: { gt: now } }],
        },
        data: { visibility: "public" },
      });

      if (toOpen.count > 0) {
        this.logger.log(
          `Automatically published ${toOpen.count} scheduled videos.`,
        );
      }

      const toClose = await this.prisma.content.updateMany({
        where: {
          deadline: { lte: now },
          visibility: "public",
        },
        data: { visibility: "unlisted" },
      });

      if (toClose.count > 0) {
        this.logger.log(
          `Automatically closed ${toClose.count} videos due to deadline.`,
        );
      }

      if (toOpen.count > 0 || toClose.count > 0) {
        await this.redis.del("catalog:videos");
        const teachers = await this.prisma.user.findMany({
          where: { role: "TEACHER" },
          select: { id: true },
        });
        for (const t of teachers) {
          await this.redis.del(`catalog:videos:teacher:${t.id}`);
        }
      }
    } catch (error) {
      this.logger.error("Error processing video deadlines", error);
    }
  }
}
