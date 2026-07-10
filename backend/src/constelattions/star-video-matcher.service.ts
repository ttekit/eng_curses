import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class StarVideoMatcherService {
    constructor(private readonly prisma: PrismaService) { }

    async matchAndAssignVideo(starId: number, targetCefr: string) {
        const star = await this.prisma.star.findUnique({
            where: { id: starId },
        });

        if (!star || !star.description) return null;

        const match = star.description.match(/^\[(.*?)\]/);
        const keyword = match ? match[1] : star.name;
        const safeKeyword = keyword.trim().split(" ")[0];

        const candidates = await this.prisma.contentVideo.findMany({
            where: {
                OR: [
                    { videoName: { contains: safeKeyword, mode: "insensitive" } },
                    { videoDescription: { contains: safeKeyword, mode: "insensitive" } },
                    {
                        content: {
                            stats: {
                                topics: {
                                    some: { name: { contains: safeKeyword, mode: "insensitive" } },
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                content: {
                    include: { stats: { include: { topics: true } } },
                },
            },
            take: 20,
        });

        if (candidates.length === 0) return null;

        let bestVideo = candidates[0];
        let maxScore = -1;

        for (const video of candidates) {
            let score = 0;
            const stats = video.content?.stats;

            if (stats?.systemTags?.includes(targetCefr)) {
                score += 50;
            }

            if (video.videoName.toLowerCase().includes(keyword.toLowerCase())) {
                score += 30;
            }

            const hasExactTopic = stats?.topics?.some((t) =>
                t.name.toLowerCase().includes(keyword.toLowerCase()),
            );
            if (hasExactTopic) {
                score += 40;
            }

            if (score > maxScore) {
                maxScore = score;
                bestVideo = video;
            }
        }

        const updatedStar = await this.prisma.star.update({
            where: { id: starId },
            data: { contentVideoId: bestVideo.id },
        });

        return updatedStar;
    }
}