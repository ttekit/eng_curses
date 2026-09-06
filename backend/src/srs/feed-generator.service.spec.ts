import { FeedGeneratorService } from "./feed-generator.service";
import { RecommendationEngineService } from "../recommendation-engine/recommendation-engine.service";

describe("FeedGeneratorService", () => {
  it("delegates feed generation to RecommendationEngineService", async () => {
    const recommendationEngineService = {
      generate_feed: jest.fn().mockResolvedValue([
        {
          segmentId: 1,
          feedKind: "review",
          contentVideoId: 10,
          videoLink: "https://example.com/a.mp4",
          startTimeSec: 1,
          endTimeSec: 3,
          fullPhrase: "Hello",
          difficultyLevel: "A2",
        },
      ]),
    };
    const prisma = {
      userSegmentSeen: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    };
    const service = new FeedGeneratorService(
      prisma as never,
      recommendationEngineService as unknown as RecommendationEngineService,
    );
    const feed = await service.generate_feed(1, 4);
    expect(recommendationEngineService.generate_feed).toHaveBeenCalledWith(1, 4, {
      excludeSegmentIds: [],
    });
    expect(feed).toHaveLength(1);
    expect(feed[0]?.feedKind).toBe("review");
  });
});
