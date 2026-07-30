import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "src/prisma.service";
import { applyListeningBumpToExistingTopics } from "src/user-language-data/user-language-data-mutation.util";
import {
  PostWatchSurveyGeminiClient,
} from "./post-watch-survey-gemini.client";
import { ConstellationProgressService } from "src/constelattions/constellation-progress.service";

@Injectable()
export class PostWatchSurveyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: PostWatchSurveyGeminiClient,
    private readonly constellationProgress: ConstellationProgressService,
  ) { }

  private async incrementUsersWatched(contentMediaId: number): Promise<void> {
    await this.prisma.contentStats.upsert({
      where: { contentMediaId },
      create: { contentMediaId, usersWatched: 1 },
      update: { usersWatched: { increment: 1 } },
    });
  }

  private utcCompletionDate(reference: Date): Date {
    return new Date(
      Date.UTC(
        reference.getUTCFullYear(),
        reference.getUTCMonth(),
        reference.getUTCDate(),
      ),
    );
  }

  private async upsertWatchSessionDaily(
    userId: number,
    contentVideoId: number,
    secondsWatched?: number,
  ): Promise<void> {
    const now = new Date();
    const completionDate = this.utcCompletionDate(now);
    await this.prisma.watchSession.upsert({
      where: {
        userId_contentVideoId_completionDate: {
          userId,
          contentVideoId,
          completionDate,
        },
      },
      create: {
        userId,
        contentVideoId,
        completionDate,
        endedAt: now,
        secondsWatched: secondsWatched ? Number(secondsWatched) : 0,
      },
      update: {
        endedAt: now,
        secondsWatched: secondsWatched ? Number(secondsWatched) : 0,
      },
    });
  }

  async recordWatchAndGenerateSurvey(
    videoId: number,
    userId: number,
    secondsWatched?: number,
    isCompleted?: boolean | string,
  ) {
    const duration = secondsWatched ? Number(secondsWatched) : 0;
    const isVideoCompleted = isCompleted === true || String(isCompleted) === "true";

    const session = await this.prisma.watchSession.upsert({
      where: {
        userId_contentVideoId_completionDate: {
          userId,
          contentVideoId: Number(videoId),
          completionDate: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      update: {
        secondsWatched: { increment: duration },
        endedAt: new Date(),
        ...(isVideoCompleted ? { completed: true } : {}),
      },
      create: {
        userId,
        contentVideoId: Number(videoId),
        completionDate: new Date(new Date().setHours(0, 0, 0, 0)),
        secondsWatched: duration,
        completed: isVideoCompleted,
        endedAt: new Date(),
      },
    });

    await this.updateUserStreak(userId);

    if (session.completed) {
      await this.bumpListeningForVideoTopics(userId, Number(videoId)).catch(() => { });
      await this.awardXpAndCheckAchievements(userId, 0);

      const linkedStars = await this.prisma.star.findMany({
        where: { contentVideoId: Number(videoId) },
      });

      for (const star of linkedStars) {
        await this.constellationProgress
          .completeStar(userId, star.id)
          .catch(() => { });
      }
    }

    return session;
  }

  private async bumpListeningForVideoTopics(
    userId: number,
    contentVideoId: number,
  ): Promise<void> {
    const video = await this.prisma.contentVideo.findUnique({
      where: { id: contentVideoId },
      include: {
        content: {
          include: {
            stats: { include: { topics: { select: { id: true } } } },
          },
        },
      },
    });
    const topicIds = video?.content?.stats?.topics.map((t) => t.id) ?? [];
    if (!topicIds.length) {
      return;
    }

    await applyListeningBumpToExistingTopics(
      this.prisma,
      userId,
      topicIds,
      0.028,
    );
  }

  async submitSurvey(
    surveyId: number,
    answers: Record<string, unknown>,
  ): Promise<{ ok: true; surveyId: number; user: any }> {
    const s = await this.prisma.postWatchSurvey.findUnique({
      where: { id: surveyId },
    });
    if (!s) {
      throw new NotFoundException(`Survey ${surveyId} not found`);
    }
    if (s.submittedAt != null) {
      throw new BadRequestException("Survey already submitted");
    }

    await this.prisma.postWatchSurvey.update({
      where: { id: surveyId },
      data: {
        answersJson: JSON.parse(
          JSON.stringify(answers),
        ) as Prisma.InputJsonValue,
        submittedAt: new Date(),
      },
    });

    if (s.userId) {
      let earnedXp = 50;

      if (answers && typeof answers === "object") {
        for (const val of Object.values(answers)) {
          if (typeof val === "string" && val.trim().length >= 10) {
            earnedXp += 50;
            break;
          }
        }
      }

      await this.awardXpAndCheckAchievements(s.userId, earnedXp);
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: s.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          hasCompletedPlacement: true,
          englishLevel: true,
          hobbies: true,
          education: true,
          workField: true,
          nativeLanguage: true,
          favoriteGenres: true,
          hatedGenres: true,
          avatarUrl: true,
          currentStreak: true,
          xp: true,
          level: true,
          achievements: {
            select: { achievementId: true },
          },
        },
      });

      return {
        ok: true,
        surveyId,
        user: updatedUser
          ? {
            ...updatedUser,
            achievements: updatedUser.achievements.map(
              (a: any) => a.achievementId,
            ),
          }
          : null,
      };
    }

    return { ok: true, surveyId, user: null };
  }

  private async updateUserStreak(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastActivityDate: true },
    });

    if (!user) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let newStreak = user.currentStreak || 0;

    if (!user.lastActivityDate) {
      newStreak = newStreak > 0 ? newStreak + 1 : 1;
    } else {
      const lastActivityStr = new Date(user.lastActivityDate)
        .toISOString()
        .split("T")[0];

      if (todayStr === lastActivityStr) {
        if (newStreak === 0) {
          newStreak = 1;
        } else {
          await this.prisma.user.update({
            where: { id: userId },
            data: { lastActivityDate: now },
          });
          return;
        }
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActivityStr === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        lastActivityDate: now,
      },
    });
  }

  public async awardXpAndCheckAchievements(
    userId: number,
    amount: number = 125,
  ) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
      select: { xp: true, level: true, currentStreak: true },
    });

    const newLevel = Math.floor((updatedUser.xp || 0) / 1000) + 1;

    if (updatedUser.level !== newLevel) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    const achievementsToUnlock: string[] = [];

    const sessionsCount = await this.prisma.watchSession.count({
      where: {
        userId,
        completed: true,
      },
    });

    if (sessionsCount >= 1) {
      await this.prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: "first-video" },
        },
        create: { userId, achievementId: "first-video" },
        update: {},
      });
    }

    if (updatedUser.currentStreak >= 7) achievementsToUnlock.push("streak-7");
    if (updatedUser.currentStreak >= 30) achievementsToUnlock.push("streak-30");

    if (achievementsToUnlock.length) {
      await this.prisma.$transaction(
        achievementsToUnlock.map((achievementId) =>
          this.prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId } },
            update: {},
            create: { userId, achievementId },
          }),
        ),
      );
    }
  }
}