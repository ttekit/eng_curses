import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { getUtcMondayWeekRange } from "src/datetime/utc-period.util";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

@Injectable()
export class AuthLearningStatsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assert_active_user(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuspended: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isSuspended) {
      throw new ForbiddenException("Account suspended");
    }
  }

  async get_learning_stats(userId: number) {
    await this.assert_active_user(userId);
    const { weekStart, weekEndExclusive } = getUtcMondayWeekRange();
    const [watchSum, distinctVideos, quizAgg, weekSessions] = await Promise.all([
      this.prisma.watchSession.aggregate({
        where: { userId },
        _sum: { secondsWatched: true },
      }),
      this.prisma.watchSession.findMany({
        where: { userId, completed: true },
        select: { contentVideoId: true },
        distinct: ["contentVideoId"],
      }),
      this.prisma.comprehensionTestAttempt.aggregate({
        where: { userId },
        _avg: { scorePct: true },
        _count: { _all: true },
      }),
      this.prisma.watchSession.findMany({
        where: {
          userId,
          endedAt: { gte: weekStart, lt: weekEndExclusive },
        },
        select: { endedAt: true, secondsWatched: true },
      }),
    ]);
    const totalSeconds = Number(watchSum._sum.secondsWatched ?? 0);
    const rawAvg = quizAgg._avg.scorePct;
    const minutesMonSun = [0, 0, 0, 0, 0, 0, 0];
    for (const session of weekSessions) {
      if (!session.endedAt) continue;
      const utcDow = session.endedAt.getUTCDay();
      const idx = utcDow === 0 ? 6 : utcDow - 1;
      minutesMonSun[idx] += Number(session.secondsWatched ?? 0) / 60;
    }
    return {
      totalWatchTimeMin: Math.floor(totalSeconds / 60),
      videosCompleted: distinctVideos.length,
      testsCompleted: quizAgg._count._all,
      averageScore:
        typeof rawAvg === "number" && Number.isFinite(rawAvg)
          ? Math.round(rawAvg)
          : null,
      weeklyActivity: DAY_LABELS.map((day, index) => ({
        day,
        minutes: Math.ceil(minutesMonSun[index]),
      })),
    };
  }
}
