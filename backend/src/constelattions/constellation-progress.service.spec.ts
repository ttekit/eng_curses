import { ProgressStatus } from "../generated/prisma/client";
import { ConstellationProgressService } from "./constellation-progress.service";

describe("ConstellationProgressService.completeStar", () => {
  it("marks constellation completed without domain side-effects", async () => {
    const prisma = {
      star: {
        findUnique: jest.fn().mockResolvedValue({
          id: 12,
          constellationId: 1,
          constellation: { kind: "PERSONAL" },
        }),
        findMany: jest.fn().mockResolvedValue([{ id: 12, prerequisites: [] }]),
      },
      userStarProgress: {
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([
          { starId: 12, status: ProgressStatus.COMPLETED },
        ]),
      },
      userConstellationProgress: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new ConstellationProgressService(
      prisma as never,
      { schedule_star_content: jest.fn() } as never,
    );
    const result = await service.completeStar(9, 12);
    expect(result.constellationCompleted).toBe(true);
    expect(prisma.userConstellationProgress.upsert).toHaveBeenCalled();
  });

  it("unlocks stars whose prerequisites are completed", async () => {
    const prisma = {
      star: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1,
          constellationId: 1,
          constellation: { kind: "PERSONAL" },
        }),
        findMany: jest.fn().mockResolvedValue([
          { id: 1, prerequisites: [] },
          { id: 2, prerequisites: [{ prerequisiteId: 1 }] },
          { id: 8, prerequisites: [{ prerequisiteId: 7 }] },
        ]),
      },
      userStarProgress: {
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      userConstellationProgress: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new ConstellationProgressService(
      prisma as never,
      { schedule_star_content: jest.fn() } as never,
    );
    const result = await service.completeStar(1, 1);
    expect(result.unlockedStars).toEqual([2]);
    expect(result.constellationCompleted).toBe(false);
  });
});

describe("ConstellationProgressService.getOptimizedConstellationGraph", () => {
  it("hides stale available status when prerequisites are incomplete", async () => {
    const prisma = {
      star: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            name: "Start",
            description: null,
            contentVideoId: null,
            type: "VIDEO",
            metadata: {},
            prerequisites: [],
            userProgress: [{ status: ProgressStatus.AVAILABLE }],
          },
          {
            id: 8,
            name: "Final test",
            description: null,
            contentVideoId: null,
            type: "TEST",
            metadata: {},
            prerequisites: [{ prerequisiteId: 7 }],
            userProgress: [{ status: ProgressStatus.AVAILABLE }],
          },
        ]),
      },
    };
    const service = new ConstellationProgressService(
      prisma as never,
      { schedule_star_content: jest.fn() } as never,
    );
    const graph = await service.getOptimizedConstellationGraph(1, 99);
    expect(graph[0]?.progressStatus).toBe(ProgressStatus.AVAILABLE);
    expect(graph[1]?.progressStatus).toBe(ProgressStatus.LOCKED);
  });
});
