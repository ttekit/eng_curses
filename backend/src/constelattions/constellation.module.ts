import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma.module";
import { ConstellationController } from "./constellation.controller";
import { ConstellationService } from "./constellation.service";
import { ConstellationGeneratorService } from "./constellation-generator.service";
import { ConstellationGeminiClient } from "./constellation-gemini.client";
import { StarVideoMatcherService } from "./star-video-matcher.service";
import { ConstellationProgressService } from "./constellation-progress.service";
import { StarContentGeneratorService } from "./star-content-generator.service";

@Module({
  imports: [PrismaModule],
  controllers: [ConstellationController],
  providers: [
    ConstellationService,
    ConstellationGeneratorService,
    ConstellationGeminiClient,
    StarVideoMatcherService,
    ConstellationProgressService,
    StarContentGeneratorService,
  ],
  exports: [
    ConstellationService,
    ConstellationGeneratorService,
    ConstellationProgressService,
    StarContentGeneratorService,
  ],
})
export class ConstellationModule {}
