import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma.module";
import { LearnerProfileService } from "./learner-profile.service";
import { RecommendationEngineService } from "./recommendation-engine.service";

@Module({
  imports: [PrismaModule],
  providers: [LearnerProfileService, RecommendationEngineService],
  exports: [LearnerProfileService, RecommendationEngineService],
})
export class RecommendationEngineModule {}
