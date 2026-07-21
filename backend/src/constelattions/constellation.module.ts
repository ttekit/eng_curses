import { Module } from "@nestjs/common";
import { ConstellationController } from "./constellation.controller";
import { ConstellationGeminiClient } from "./constellation-gemini.client";
import { ConstellationGeneratorService } from "./constellation-generator.service";
import { ConstellationProgressService } from "./constellation-progress.service";
import { StarVideoMatcherService } from "./star-video-matcher.service";
import { PrismaService } from "src/prisma.service";
import { ConstellationService } from "./constellation.service";

@Module({
    controllers: [ConstellationController],
    providers: [
        PrismaService,
        ConstellationGeminiClient,
        ConstellationGeneratorService,
        ConstellationProgressService,
        StarVideoMatcherService,
        ConstellationService,
    ],
    exports: [ConstellationProgressService],
})
export class ConstellationModule { }