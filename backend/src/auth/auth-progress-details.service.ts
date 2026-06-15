import { BadRequestException, Injectable } from "@nestjs/common";
import type { Prisma } from "@generated/prisma/client";
import { PrismaService } from "src/prisma.service";

type WatchSessionWithVideo = Prisma.WatchSessionGetPayload<{
  include: { contentVideo: true };
}>;

@Injectable()
export class AuthProgressDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async get_progress_details(userId: number) {
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException("Invalid user ID");
    }
    const vocabularyProgress = await this.load_vocabulary_progress(userId);
    const recentVideos = await this.load_recent_videos(userId);
    const learningPaths = await this.load_learning_paths(userId);
    return { vocabularyProgress, recentVideos, learningPaths };
  }

  private async load_vocabulary_progress(userId: number) {
    const [total, learned, mastered] = await Promise.all([
      this.prisma.userVocabulary.count({ where: { userId } }),
      this.prisma.userVocabulary.count({
        where: { userId, mastery: { gt: 0 } },
      }),
      this.prisma.userVocabulary.count({
        where: { userId, mastery: { gte: 0.8 } },
      }),
    ]);
    return {
      total,
      learned,
      mastered,
      reviewing: Math.max(0, total - mastered),
    };
  }

  private async load_recent_videos(userId: number) {
    const recentSessions = await this.prisma.watchSession.findMany({
      where: { userId },
      orderBy: { endedAt: "desc" },
      take: 4,
      include: { contentVideo: true },
    });
    return Promise.all(
      recentSessions.map((session) => this.map_recent_video(userId, session)),
    );
  }

  private async map_recent_video(
    userId: number,
    session: WatchSessionWithVideo,
  ) {
    const test = await this.prisma.comprehensionTestAttempt.findFirst({
      where: { userId, contentVideoId: session.contentVideoId },
      orderBy: { createdAt: "desc" },
    });
    return {
      id: String(session.id),
      title: session.contentVideo?.videoName || "Video Lesson",
      category: "General",
      completed: Boolean(session.completed),
      score: test ? Math.round(test.scorePct) : 0,
      progress: session.completed ? 100 : 50,
    };
  }

  private async load_learning_paths(userId: number) {
    const [businessCount, travelCount] = await Promise.all([
      this.prisma.watchSession.count({
        where: {
          userId,
          completed: true,
          contentVideo: { content: { category: { name: "Business English" } } },
        },
      }),
      this.prisma.watchSession.count({
        where: {
          userId,
          completed: true,
          contentVideo: {
            content: { category: { name: "Travel & Conversation" } },
          },
        },
      }),
    ]);
    return [
      {
        id: "business",
        title: "Business English",
        description: "Professional communication for the workplace",
        progress: Math.min(100, Math.round((businessCount / 12) * 100)),
        totalVideos: 12,
        completedVideos: businessCount,
        level: "B2",
        accentClass: "bg-primary",
      },
      {
        id: "travel",
        title: "Travel & Conversation",
        description: "Essential phrases for traveling abroad",
        progress: Math.min(100, Math.round((travelCount / 10) * 100)),
        totalVideos: 10,
        completedVideos: travelCount,
        level: "B1",
        accentClass: "bg-accent",
      },
    ];
  }
}
