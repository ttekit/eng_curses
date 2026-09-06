import { ConstellationGeneratorService } from "./constellation-generator.service";
import { ConstellationKind } from "./constellation-kind";

const validQuestions = Array.from({ length: 5 }, (_, index) => ({
  id: `q${index + 1}`,
  type: "blind_audio",
  prompt: "Pick",
  options: ["a", "b", "c"],
  correctAnswer: "a",
}));

function build_fresh_constellation(id: number) {
  return {
    id,
    kind: ConstellationKind.PERSONAL,
    stars: [
      {
        type: "GRAMMAR",
        metadata: {
          contentStatus: "ready",
          questions: validQuestions,
          rule: "x".repeat(200),
          examples: Array.from({ length: 5 }, () => ({ en: "a", uk: "b" })),
        },
      },
    ],
  };
}

describe("ConstellationGeneratorService.ensurePersonalConstellationForUser", () => {
  function build_service(overrides: {
    existing?: { id: number; kind?: string; stars?: unknown[] } | null;
    generateResult?: { id: number };
  }) {
    const prisma = {
      constellation: {
        findFirst: jest.fn().mockResolvedValue(overrides.existing ?? null),
        delete: jest.fn().mockResolvedValue({}),
      },
      additionalUserData: {
        findUnique: jest.fn().mockResolvedValue({
          learningGoal: "Travel",
          workField: null,
        }),
      },
      userLanguageData: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const gemini = { generateConstellation: jest.fn() };
    const starContentGenerator = {
      ensure_star_content: jest.fn().mockResolvedValue(undefined),
      schedule_star_content: jest.fn(),
    };
    const service = new ConstellationGeneratorService(
      prisma as never,
      gemini as never,
      starContentGenerator as never,
    );
    const generateAndSaveConstellation = jest
      .spyOn(service, "generateAndSaveConstellation")
      .mockResolvedValue((overrides.generateResult ?? { id: 20 }) as never);
    return { service, prisma, generateAndSaveConstellation };
  }

  it("skips Gemini when user already has an up-to-date constellation", async () => {
    const { service, generateAndSaveConstellation } = build_service({
      existing: build_fresh_constellation(5),
    });
    const result = await service.ensurePersonalConstellationForUser(3, "A1");
    expect(generateAndSaveConstellation).not.toHaveBeenCalled();
    expect(result).toEqual(build_fresh_constellation(5));
  });

  it("regenerates stale legacy constellations via Gemini", async () => {
    const { service, prisma, generateAndSaveConstellation } = build_service({
      existing: {
        id: 5,
        kind: ConstellationKind.PERSONAL,
        stars: [
          {
            type: "GRAMMAR",
            metadata: {
              quiz: [{ question: "Q", options: ["a"], correctAnswer: "a" }],
            },
          },
        ],
      },
      generateResult: { id: 99 },
    });
    const result = await service.ensurePersonalConstellationForUser(3, "A1");
    expect(prisma.constellation.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(generateAndSaveConstellation).toHaveBeenCalled();
    expect(result).toEqual({ id: 99 });
  });

  it("generates via Gemini for A1 when missing", async () => {
    const { service, generateAndSaveConstellation } = build_service({
      generateResult: { id: 99 },
    });
    const result = await service.ensurePersonalConstellationForUser(3, "A1");
    expect(generateAndSaveConstellation).toHaveBeenCalledWith(
      expect.stringContaining("absolute beginner"),
      "A1",
      3,
      expect.objectContaining({ kind: ConstellationKind.PERSONAL }),
    );
    expect(result).toEqual({ id: 99 });
  });

  it("generates via Gemini for B1 with learning goal", async () => {
    const { service, generateAndSaveConstellation } = build_service({
      generateResult: { id: 11 },
    });
    const result = await service.ensurePersonalConstellationForUser(3, "B1");
    expect(generateAndSaveConstellation).toHaveBeenCalledWith(
      "Travel",
      "B1",
      3,
      expect.objectContaining({ kind: ConstellationKind.PERSONAL }),
    );
    expect(result).toEqual({ id: 11 });
  });
});
