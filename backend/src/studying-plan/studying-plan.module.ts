import { Module } from "@nestjs/common";
import { StudyingPlanGeminiClient } from "./studying-plan-gemini.client";
import { StudyingPlanRegenerationService } from "./studying-plan-regeneration.service";

@Module({
  providers: [StudyingPlanGeminiClient, StudyingPlanRegenerationService],
  exports: [StudyingPlanRegenerationService],
})
export class StudyingPlanModule {}
