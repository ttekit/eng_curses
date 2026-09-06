import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma.module";
import { RecommendationEngineModule } from "../recommendation-engine/recommendation-engine.module";
import { FeedGeneratorService } from "./feed-generator.service";
import {
  FeedController,
  ProgressController,
  SrsAdminController,
} from "./srs.controller";
import { SpacedRepetitionService } from "./spaced-repetition.service";
import { SubtitleIngestionService } from "./subtitle-ingestion.service";

@Module({
  imports: [PrismaModule, RecommendationEngineModule],
  controllers: [ProgressController, FeedController, SrsAdminController],
  providers: [
    SubtitleIngestionService,
    SpacedRepetitionService,
    FeedGeneratorService,
  ],
  exports: [
    SubtitleIngestionService,
    SpacedRepetitionService,
    FeedGeneratorService,
  ],
})
export class SrsModule {}
