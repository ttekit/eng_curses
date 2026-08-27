import { RecommendationEngineService } from "./recommendation-engine.service";
import { LearnerProfileService } from "./learner-profile.service";
import * as feedQueries from "./feed-candidate.queries";
import * as shiftQueries from "./context-shift.queries";
import * as enrichment from "./segment-enrichment.util";
import * as segmentVector from "./segment-vector.util";

jest.mock("./feed-candidate.queries");
jest.mock("./context-shift.queries");
jest.mock("./segment-enrichment.util");
jest.mock("./segment-vector.util");

describe("RecommendationEngineService", () => {
  const profile = {
    userId: 1,
    proficiencyLevel: 2,
    targetAccent: "general-american",
    interestsVector: null,
    knownWords: ["hello"],
  };
  const lexicon = {
    knownWords: new Set(["hello"]),
    learningWords: new Map([
      ["world", { word: "world", lastSeenAt: new Date(), memoryStrength: 2 }],
    ]),
  };

  type MockPrisma = {
    userWordMemory: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    userSegmentSeen: { findMany: jest.Mock };
    watchSession: { findMany: jest.Mock };
    videoSegment: { findUnique: jest.Mock };
    learnerEngineProfile: { update: jest.Mock; findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  function build_service(): {
    service: RecommendationEngineService;
    prisma: MockPrisma;
  } {
    const prisma: MockPrisma = {
      userWordMemory: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userSegmentSeen: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      watchSession: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      videoSegment: { findUnique: jest.fn() },
      learnerEngineProfile: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (tx: MockPrisma) => Promise<void>) =>
        callback(prisma),
      ),
    };
    const learnerProfileService = {
      load_profile: jest.fn().mockResolvedValue(profile),
      load_lexicon: jest.fn().mockResolvedValue(lexicon),
    };
    const service = new RecommendationEngineService(
      prisma as never,
      learnerProfileService as unknown as LearnerProfileService,
    );
    return { service, prisma };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generate_feed returns enriched segments when candidates exist", async () => {
    const { service } = build_service();
    jest.spyOn(feedQueries, "fetch_feed_candidates").mockResolvedValue([
      {
        id: 10,
        content_video_id: 5,
        start_time_sec: 1,
        end_time_sec: 3,
        full_phrase: "hello world",
        proficiency_level: 2,
        accent: "general-american",
        words: ["hello", "world"],
        cos_sim: 0,
      },
    ]);
    jest.spyOn(enrichment, "rank_feed_candidates").mockReturnValue([
      {
        segmentId: 10,
        contentVideoId: 5,
        startTimeSec: 1,
        endTimeSec: 3,
        fullPhrase: "hello world",
        proficiencyLevel: 2,
        accent: "general-american",
        words: ["hello", "world"],
        breakdown: { sContext: 1, sLevel: 1, sAccent: 1, sSrs: 1, total: 1 },
        feedKind: "review",
      },
    ]);
    jest.spyOn(enrichment, "enrich_to_feed_dtos").mockResolvedValue([
      {
        segmentId: 10,
        contentVideoId: 5,
        fileUrl: "https://example.com/a.mp4",
        startTimeSec: 1,
        endTimeSec: 3,
        fullPhrase: "hello world",
        difficultyLevel: "A2",
        feedKind: "review",
        tokens: [],
      },
    ]);
    const feed = await service.generate_feed(1, 1);
    expect(feed).toHaveLength(1);
    expect(feed[0]?.feedKind).toBe("review");
  });

  it("handle_context_shift penalizes clicked word and returns next segment", async () => {
    const { service, prisma } = build_service();
    prisma.userWordMemory.findUnique.mockResolvedValue(null);
    prisma.userWordMemory.upsert.mockResolvedValue({});
    jest.spyOn(segmentVector, "read_segment_vector").mockResolvedValue(null);
    jest.spyOn(shiftQueries, "fetch_context_shift_candidates").mockResolvedValue([
      {
        id: 11,
        content_video_id: 5,
        start_time_sec: 4,
        end_time_sec: 6,
        full_phrase: "brave new world",
        proficiency_level: 2,
        accent: "general-american",
        words: ["world"],
        cos_sim: 0.2,
      },
    ]);
    jest.spyOn(enrichment, "rank_context_shift_candidates").mockReturnValue([
      {
        segmentId: 11,
        contentVideoId: 5,
        startTimeSec: 4,
        endTimeSec: 6,
        fullPhrase: "brave new world",
        proficiencyLevel: 2,
        accent: "general-american",
        words: ["world"],
        breakdown: { sContext: 0.2, sLevel: 0, sAccent: 1, sSrs: 0.8, total: 0.68 },
        feedKind: "review",
      },
    ]);
    jest.spyOn(enrichment, "enrich_to_feed_dtos").mockResolvedValue([
      {
        segmentId: 11,
        contentVideoId: 5,
        fileUrl: "https://example.com/a.mp4",
        startTimeSec: 4,
        endTimeSec: 6,
        fullPhrase: "brave new world",
        difficultyLevel: "A2",
        feedKind: "review",
        tokens: [],
      },
    ]);
    const result = await service.handle_context_shift(1, 10, "world");
    expect(result.penalizedWord).toBe("world");
    expect(result.nextSegment?.segmentId).toBe(11);
    expect(prisma.userWordMemory.upsert).toHaveBeenCalled();
  });

  it("process_watch_feedback skips short watches", async () => {
    const { service } = build_service();
    const result = await service.process_watch_feedback(1, 10, 0.5, 2);
    expect(result.skipped).toBe(true);
    expect(result.updatedWords).toEqual([]);
  });
});
