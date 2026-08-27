import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

export type MatchVideoOptions = {
  /** When true, missing candidates do not throw and return null quietly. */
  readonly softFail?: boolean;
};

/**
 * Assigns a catalog video to a VIDEO star by topic keyword search.
 */
@Injectable()
export class StarVideoMatcherService {
  private readonly logger = new Logger(StarVideoMatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  async matchAndAssignVideo(
    starId: number,
    targetCefr: string,
    options: MatchVideoOptions = {},
  ) {
    const star = await this.prisma.star.findUnique({
      where: { id: starId },
    });
    if (!star || !star.description) return null;

    const match = star.description.match(/^\[(.*?)\]/);
    const keyword = (match ? match[1] : star.name).trim();
    if (!keyword) return null;

    // Prefer whole topic phrase; also try significant tokens for recall.
    const tokens = keyword
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3)
      .slice(0, 4);
    const searchTerms = [keyword, ...tokens].filter(
      (term, index, arr) => arr.indexOf(term) === index,
    );

    const orFilters = searchTerms.flatMap((term) => [
      { videoName: { contains: term, mode: "insensitive" as const } },
      { videoDescription: { contains: term, mode: "insensitive" as const } },
      {
        content: {
          stats: {
            topics: {
              some: { name: { contains: term, mode: "insensitive" as const } },
            },
          },
        },
      },
    ]);

    const candidates = await this.prisma.contentVideo.findMany({
      where: { OR: orFilters },
      include: {
        content: {
          include: { stats: { include: { topics: true } } },
        },
      },
      take: 20,
    });

    if (candidates.length === 0) {
      if (options.softFail) {
        this.logger.debug(
          `No video match for star ${starId} topic "${keyword}" (softFail)`,
        );
        return null;
      }
      return null;
    }

    let bestVideo = candidates[0]!;
    let maxScore = -1;
    const keywordLower = keyword.toLowerCase();

    for (const video of candidates) {
      let score = 0;
      const stats = video.content?.stats;
      if (stats?.systemTags?.includes(targetCefr)) score += 50;
      if (video.videoName.toLowerCase().includes(keywordLower)) score += 30;
      const hasExactTopic = stats?.topics?.some((t) =>
        t.name.toLowerCase().includes(keywordLower),
      );
      if (hasExactTopic) score += 40;
      if (score > maxScore) {
        maxScore = score;
        bestVideo = video;
      }
    }

    return this.prisma.star.update({
      where: { id: starId },
      data: { contentVideoId: bestVideo.id },
    });
  }
}
