import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RecommendationEngineService } from "src/recommendation-engine/recommendation-engine.service";
import type { FeedSegmentDto } from "./feed.types";

@Injectable()
export class FeedGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationEngineService: RecommendationEngineService,
  ) {}

  async generate_feed(
    userId: number,
    limit = 20,
    excludeSegmentIds: number[] = [],
  ): Promise<FeedSegmentDto[]> {
    return this.recommendationEngineService.generate_feed(userId, limit, {
      excludeSegmentIds,
    });
  }

  async mark_segment_seen(userId: number, segmentId: number): Promise<void> {
    await this.prisma.userSegmentSeen.upsert({
      where: { userId_segmentId: { userId, segmentId } },
      create: { userId, segmentId },
      update: { seenAt: new Date() },
    });
  }
}
