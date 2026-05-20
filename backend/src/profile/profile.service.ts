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

        // 1. Вычисляем начало текущей недели (Понедельник) и конец (Воскресенье)
        const now = new Date();
        const dayOfWeek = now.getUTCDay(); // 0 это Воскресенье, 1 это Понедельник
        const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

        // 2. Ищем все просмотры видео за эту неделю
        const weekSessions = await this.prisma.watchSession.findMany({
            where: {
                userId: userId,
                endedAt: { gte: weekStart, lt: weekEnd },
            },
            select: { endedAt: true },
        });

        // 3. Ищем все пройденные тесты за эту неделю
        const weekTests = await this.prisma.comprehensionTestAttempt.findMany({
            where: {
                userId: userId,
                createdAt: { gte: weekStart, lt: weekEnd },
            },
            select: { createdAt: true },
        });

        // 4. Считаем активность по дням (индекс 0 - Понедельник, 6 - Воскресенье)
        const minutesMonSun = [0, 0, 0, 0, 0, 0, 0];
        const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const processDate = (dateToProcess: Date | null | undefined) => {
            if (!dateToProcess) return;
            const utcDow = dateToProcess.getUTCDay();
            const idx = utcDow === 0 ? 6 : utcDow - 1; // Превращаем 0 (Вс) в 6, остальные сдвигаем
            minutesMonSun[idx] += 1; // Записываем условную "1 минуту", чтобы огонек загорелся
        };

        weekSessions.forEach(s => processDate(s.endedAt));
        weekTests.forEach(t => processDate(t.createdAt));

        const weeklyActivity = DAY_LABELS.map((day, i) => ({
            day,
            minutes: minutesMonSun[i],
        }));

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

    async getProgressDetails(userId: number) {
        if (!userId || Number.isNaN(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        const totalWords = await this.prisma.userVocabulary.count({
            where: { userId },
        });

        const masteredWords = await this.prisma.userVocabulary.count({
            where: {
                userId,
                mastery: { gte: 0.8 },
            },
        });

        const reviewingWords = Math.max(0, totalWords - masteredWords);

        const vocabularyProgress = {
            total: Math.max(1000, Math.ceil((totalWords + 1) / 500) * 500),
            learned: totalWords,
            mastered: masteredWords,
            reviewing: reviewingWords,
        };

        const recentSessions = await this.prisma.watchSession.findMany({
            where: { userId },
            orderBy: { endedAt: 'desc' },
            take: 4,
            include: { contentVideo: true },
        });

        const recentVideos = await Promise.all(
            recentSessions.map(async (session) => {
                const test = await this.prisma.comprehensionTestAttempt.findFirst({
                    where: { userId, contentVideoId: session.contentVideoId },
                    orderBy: { createdAt: 'desc' },
                });

                return {
                    id: String(session.id),
                    title: session.contentVideo?.videoName || 'Video Lesson',
                    category: 'General',
                    completed: session.completed,
                    score: test ? Math.round(test.scorePct) : 0,
                    progress: session.completed ? 100 : 50,
                };
            }),
        );

        const completedVideosCount = await this.prisma.watchSession.count({
            where: { userId, completed: true },
        });

        const learningPaths = [
            {
                id: 'business',
                title: 'Business English',
                description: 'Professional communication for the workplace',
                progress: totalWords > 0 ? Math.min(100, Math.round((masteredWords / totalWords) * 100)) : 0,
                totalVideos: 12,
                completedVideos: Math.min(12, completedVideosCount),
                level: 'B2',
                accentClass: 'bg-primary',
            },
            {
                id: 'travel',
                title: 'Travel & Conversation',
                description: 'Essential phrases for traveling abroad',
                progress: totalWords > 0 ? Math.min(100, Math.round((totalWords / 100) * 100)) : 0,
                totalVideos: 10,
                completedVideos: Math.min(10, completedVideosCount),
                level: 'B1',
                accentClass: 'bg-accent',
            },
        ];

        return {
            vocabularyProgress,
            recentVideos,
            learningPaths,
        };
    }
}