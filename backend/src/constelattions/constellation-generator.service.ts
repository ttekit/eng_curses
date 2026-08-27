import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  ConstellationGeminiClient,
  type GenerateConstellationOptions,
} from "./constellation-gemini.client";
import { ConstellationKind } from "./constellation-kind";
import { resolve_weak_skills_from_rows } from "./weak-skills.util";
import { bootstrap_constellation_progress } from "./bootstrap-progress.util";
import { build_constellation_domain } from "./constellation-domain.util";
import { validate_constellation_plan } from "./generated-constellation.validator";
import { constellation_needs_regeneration } from "./constellation-stale.util";
import {
  StarContentGeneratorService,
  build_plan_metadata,
} from "./star-content-generator.service";

export type SaveConstellationOptions = GenerateConstellationOptions & {
  readonly kind?: string | null;
};

const GEMINI_MAX_ATTEMPTS = 3;

/**
 * Generates personal learning constellations exclusively via Gemini.
 */
@Injectable()
export class ConstellationGeneratorService {
  private readonly logger = new Logger(ConstellationGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: ConstellationGeminiClient,
    private readonly starContentGenerator: StarContentGeneratorService,
  ) {}

  /**
   * Ensures a Gemini-generated personal constellation exists for the user.
   * Regenerates stale or static foundation constellations automatically.
   */
  async ensurePersonalConstellationForUser(
    userId: number,
    cefrLevel: string,
    domain?: string,
  ) {
    const existing = await this.prisma.constellation.findFirst({
      where: { userId },
      include: { stars: true },
      orderBy: { id: "asc" },
    });
    if (existing && !constellation_needs_regeneration(existing)) {
      this.logger.log(
        `User ${userId} has up-to-date Gemini constellation ${existing.id}`,
      );
      return existing;
    }
    if (existing) {
      this.logger.log(
        `User ${userId} constellation ${existing.id} is stale — regenerating via Gemini`,
      );
      await this.delete_user_constellation(existing.id);
    }

    const normalized = cefrLevel.trim().toUpperCase() || "A1";
    const profile = await this.prisma.additionalUserData.findUnique({
      where: { userId },
      select: { learningGoal: true, workField: true },
    });
    const languageRows = await this.prisma.userLanguageData.findMany({
      where: { userId },
      select: {
        listeningScore: true,
        vocabularyScore: true,
        grammarScore: true,
      },
      take: 50,
    });
    const targetDomain = build_constellation_domain({
      cefrLevel: normalized,
      learningGoal: profile?.learningGoal,
      workField: profile?.workField,
      domainOverride: domain,
    });
    return this.generateAndSaveConstellation(targetDomain, normalized, userId, {
      kind: ConstellationKind.PERSONAL,
      weakSkills: resolve_weak_skills_from_rows(languageRows),
    });
  }

  /**
   * Forces a fresh Gemini constellation for the user (deletes prior progress).
   */
  async regeneratePersonalConstellationForUser(
    userId: number,
    domain?: string,
  ) {
    const profile = await this.prisma.additionalUserData.findUnique({
      where: { userId },
      select: { englishLevel: true, learningGoal: true, workField: true },
    });
    const cefrLevel = profile?.englishLevel?.trim().toUpperCase() || "A1";
    const existing = await this.prisma.constellation.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (existing) {
      await this.delete_user_constellation(existing.id);
    }
    const targetDomain =
      domain ??
      build_constellation_domain({
        cefrLevel,
        learningGoal: profile?.learningGoal,
        workField: profile?.workField,
      });
    return this.generateAndSaveConstellation(targetDomain, cefrLevel, userId, {
      kind: ConstellationKind.PERSONAL,
      weakSkills: resolve_weak_skills_from_rows(
        await this.prisma.userLanguageData.findMany({
          where: { userId },
          select: {
            listeningScore: true,
            vocabularyScore: true,
            grammarScore: true,
          },
          take: 50,
        }),
      ),
    });
  }

  async generateAndSaveConstellation(
    domain: string,
    cefrLevel: string,
    userId?: number,
    options: SaveConstellationOptions = {},
  ) {
    let generated = null;
    let lastReason = "Unknown validation failure";
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
      generated = await this.gemini.generateConstellationPlan(domain, cefrLevel, {
        priorLemmas: options.priorLemmas,
        weakSkills: options.weakSkills,
      });
      const validation = validate_constellation_plan(generated);
      if (validation.valid) {
        break;
      }
      lastReason = validation.reason;
      this.logger.warn(
        `Gemini constellation validation failed (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}): ${validation.reason}`,
      );
      generated = null;
    }
    if (!generated?.stars?.length) {
      throw new InternalServerErrorException(
        `Failed to generate valid Gemini constellation: ${lastReason}`,
      );
    }

    const kind =
      options.kind !== undefined
        ? options.kind
        : userId
          ? ConstellationKind.PERSONAL
          : null;
    const constellation = await this.prisma.constellation.create({
      data: {
        name: generated.constellationName,
        description: generated.description,
        userId: userId ?? null,
        kind,
      },
    });

    const tempIdToDbId = new Map<string, number>();
    const prerequisitesData: { prerequisiteId: number; dependentId: number }[] =
      [];
    for (const gStar of generated.stars) {
      const metadata = build_plan_metadata(gStar.metadata);
      const star = await this.prisma.star.create({
        data: {
          constellationId: constellation.id,
          name: gStar.name,
          description: `[${gStar.topic}] ${gStar.description}`,
          type: gStar.type === "VIDEO" ? "PHRASE" : gStar.type || "GRAMMAR",
          metadata: metadata as object,
        },
      });
      tempIdToDbId.set(gStar.id, star.id);
    }
    for (const gStar of generated.stars) {
      const dependentId = tempIdToDbId.get(gStar.id);
      if (!dependentId) continue;
      for (const tempReqId of gStar.prerequisiteIds) {
        const prerequisiteId = tempIdToDbId.get(tempReqId);
        if (prerequisiteId) {
          prerequisitesData.push({ prerequisiteId, dependentId });
        }
      }
    }
    if (prerequisitesData.length > 0) {
      await this.prisma.starPrerequisite.createMany({
        data: prerequisitesData,
        skipDuplicates: true,
      });
    }
    if (userId) {
      await bootstrap_constellation_progress(
        this.prisma,
        userId,
        constellation.id,
        tempIdToDbId,
        prerequisitesData,
      );
      const firstStarId = resolve_first_star_id(tempIdToDbId, prerequisitesData);
      if (firstStarId) {
        await this.starContentGenerator.ensure_star_content(firstStarId);
      }
    }
    return this.prisma.constellation.findUnique({
      where: { id: constellation.id },
      include: { stars: { include: { prerequisites: true } } },
    });
  }

  private async delete_user_constellation(constellationId: number): Promise<void> {
    await this.prisma.constellation.delete({ where: { id: constellationId } });
  }
}

function resolve_first_star_id(
  tempIdToDbId: Map<string, number>,
  prerequisitesData: { prerequisiteId: number; dependentId: number }[],
): number | undefined {
  const dependentIds = new Set(prerequisitesData.map((item) => item.dependentId));
  const rootIds = Array.from(tempIdToDbId.values())
    .filter((id) => !dependentIds.has(id))
    .sort((left, right) => left - right);
  return rootIds[0] ?? Array.from(tempIdToDbId.values())[0];
}
