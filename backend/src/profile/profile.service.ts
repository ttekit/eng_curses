import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

// Определяем интерфейс для логов, чтобы TS понимал структуру
interface ActivityLog {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    rawDate: Date;
}

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) { }

    async getLearningStats(userId: number) {
        if (!userId || Number.isNaN(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const testAttempts = await this.prisma.comprehensionTestAttempt.findMany({
            where: { userId: userId },
        });

        const testsCompleted = testAttempts.length;
        // Инициализируем averageScore как число или null явно
        let averageScore: number | null = null;

        if (testsCompleted > 0) {
            const totalScore = testAttempts.reduce((acc, curr) => acc + (curr.scorePct || 0), 0);
            averageScore = totalScore / testsCompleted;
        }

        const watchedVideosCount = await this.prisma.watchSession.count({
            where: {
                userId: userId,
                completed: true
            },
        });

        const weeklyActivity = [
            { day: 'Monday', minutes: 15 },
            { day: 'Tuesday', minutes: 0 },
            { day: 'Wednesday', minutes: 20 },
            { day: 'Thursday', minutes: 0 },
            { day: 'Friday', minutes: 30 },
            { day: 'Saturday', minutes: 0 },
            { day: 'Sunday', minutes: 10 },
        ];

        return {
            totalWatchTimeMin: 0,
            videosCompleted: watchedVideosCount,
            testsCompleted: testsCompleted,
            averageScore: averageScore,
            weeklyActivity,
        };
    }

    async getActivityLog(userId: number) {
        if (!userId || Number.isNaN(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        // Явно типизируем массив логов
        const logs: ActivityLog[] = [];

        const recentTests = await this.prisma.comprehensionTestAttempt.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                contentVideo: true,
            }
        });

        recentTests.forEach((test) => {
            logs.push({
                id: `test-${test.id}`,
                type: 'video_completed',
                title: `Completed Quiz: ${test.contentVideo?.videoName || 'Video'}`,
                description: `Scored ${Math.round(test.scorePct || 0)}%`,
                timestamp: test.createdAt.toLocaleDateString(),
                rawDate: test.createdAt
            });
        });

        const recentWatches = await this.prisma.watchSession.findMany({
            where: { userId: userId },
            orderBy: { endedAt: 'desc' },
            take: 5,
            include: {
                contentVideo: true,
            }
        });

        recentWatches.forEach((watch) => {
            logs.push({
                id: `watch-${watch.id}`,
                type: 'video_started',
                title: `Watched: ${watch.contentVideo?.videoName || 'Video'}`,
                description: `Watched for ${Math.round((watch.secondsWatched || 0) / 60)} minutes`,
                timestamp: watch.endedAt.toLocaleDateString(),
                rawDate: watch.endedAt
            });
        });

        logs.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        // Убираем rawDate перед отправкой на фронтенд
        return logs.slice(0, 7).map(({ rawDate, ...rest }) => rest);
    }
}