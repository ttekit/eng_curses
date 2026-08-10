import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { ConstellationGeminiClient } from "./constellation-gemini.client";
import { StarVideoMatcherService } from "./star-video-matcher.service";

@Injectable()
export class ConstellationGeneratorService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gemini: ConstellationGeminiClient,
        private readonly matcher: StarVideoMatcherService,
    ) { }

    async generateAndSaveConstellation(domain: string, cefrLevel: string, userId?: number) {
        const generated = await this.gemini.generateConstellation(domain, cefrLevel);

        if (!generated || !generated.stars || generated.stars.length === 0) {
            throw new InternalServerErrorException("Failed to generate constellation graph");
        }

        const constellation = await this.prisma.constellation.create({
            data: {
                name: generated.constellationName,
                description: generated.description,
                userId: userId ?? null,
            },
        });

        const tempIdToDbId = new Map<string, number>();

        for (const gStar of generated.stars) {
            const star = await this.prisma.star.create({
                data: {
                    constellationId: constellation.id,
                    name: gStar.name,
                    description: `[${gStar.topic}] ${gStar.description}`,
                    type: gStar.type || 'VIDEO',
                    metadata: gStar.metadata || null,
                },
            });
            tempIdToDbId.set(gStar.id, star.id);
        }

        const prerequisitesData: { prerequisiteId: number; dependentId: number }[] = [];

        for (const gStar of generated.stars) {
            const dependentId = tempIdToDbId.get(gStar.id);
            if (!dependentId) continue;

            for (const tempReqId of gStar.prerequisiteIds) {
                const prerequisiteId = tempIdToDbId.get(tempReqId);
                if (prerequisiteId) {
                    prerequisitesData.push({
                        prerequisiteId,
                        dependentId,
                    });
                }
            }
        }

        if (prerequisitesData.length > 0) {
            await this.prisma.starPrerequisite.createMany({
                data: prerequisitesData,
                skipDuplicates: true,
            });
        }

        for (const gStar of generated.stars) {
            const dbId = tempIdToDbId.get(gStar.id);
            if (dbId && (!gStar.type || gStar.type === 'VIDEO')) {
                await this.matcher.matchAndAssignVideo(dbId, cefrLevel);
            }
        }

        if (userId) {
            await this.prisma.userConstellationProgress.create({
                data: {
                    userId,
                    constellationId: constellation.id,
                    status: "AVAILABLE",
                },
            }).catch(() => undefined);

            const dependentIds = new Set(prerequisitesData.map(p => p.dependentId));

            const firstStarId = Array.from(tempIdToDbId.values()).find(id => !dependentIds.has(id))
                ?? Array.from(tempIdToDbId.values())[0];

            if (firstStarId) {
                await this.prisma.userStarProgress.create({
                    data: {
                        userId,
                        starId: firstStarId,
                        status: "AVAILABLE",
                    },
                }).catch(() => undefined);
            }
        }

        return this.prisma.constellation.findUnique({
            where: { id: constellation.id },
            include: {
                stars: {
                    include: {
                        prerequisites: true,
                    },
                },
            },
        });
    }
}