import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma.module";
import { ConstellationController } from "./constellation.controller";
import { ConstellationService } from "./constellation.service";
import { ConstellationGeneratorService } from "./constellation-generator.service";
import { ConstellationGeminiClient } from "./constellation-gemini.client";
import { StarVideoMatcherService } from "./star-video-matcher.service";
import { ConstellationProgressService } from "./constellation-progress.service";

@Module({
    imports: [PrismaModule],
    controllers: [ConstellationController],
    providers: [
        ConstellationService,
        ConstellationGeneratorService,
        ConstellationGeminiClient,
        StarVideoMatcherService,
        ConstellationProgressService,
    ],
    exports: [ConstellationService, ConstellationGeneratorService],
})
export class ConstellationModule { }