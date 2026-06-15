import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma.service";
import { AlcorythmService } from "src/alcorythm/alcorythm.service";
import { isDevModeEnabled } from "src/common/utils/outbound-mail-disabled.util";

export type KnowledgeTagRow = {
  name: string;
  score: number;
  listening: number;
  vocabulary: number;
  grammar: number;
  topicCount: number;
};

@Injectable()
export class AuthKnowledgeTagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly alcorythmService: AlcorythmService,
  ) {}

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

  async get_knowledge_tag_progress(userId: number): Promise<{ tags: KnowledgeTagRow[] }> {
    await this.assert_active_user(userId);
    const rows = await this.prisma.userLanguageData.findMany({
      where: { userId },
      include: {
        topic: { include: { tags: { select: { name: true } } } },
      },
    });
    const accum = new Map<
      string,
      { l: number; v: number; g: number; agg: number; n: number }
    >();
    for (const row of rows) {
      for (const tag of row.topic.tags) {
        const name = tag.name.trim();
        if (!name) continue;
        const cur = accum.get(name) ?? { l: 0, v: 0, g: 0, agg: 0, n: 0 };
        cur.l += row.listeningScore;
        cur.v += row.vocabularyScore;
        cur.g += row.grammarScore;
        cur.agg += row.score;
        cur.n += 1;
        accum.set(name, cur);
      }
    }
    const tags = [...accum.entries()]
      .map(([name, cur]) => {
        const n = cur.n;
        return {
          name,
          listening: Math.round((cur.l / n) * 1000) / 1000,
          vocabulary: Math.round((cur.v / n) * 1000) / 1000,
          grammar: Math.round((cur.g / n) * 1000) / 1000,
          score: Math.round((cur.agg / n) * 1000) / 1000,
          topicCount: cur.n,
        };
      })
      .sort((a, b) => b.score - a.score);
    return { tags };
  }

  async refresh_knowledge_tag_progress(
    userId: number,
  ): Promise<{ tags: KnowledgeTagRow[] }> {
    if (!isDevModeEnabled(this.configService)) {
      throw new ForbiddenException(
        "Knowledge tag refresh is only available when DEV_MODE is enabled",
      );
    }
    await this.alcorythmService.analyzeUserLevel(userId);
    return this.get_knowledge_tag_progress(userId);
  }
}
