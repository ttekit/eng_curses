import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { UserVocabularyModule } from "src/user-vocabulary/user-vocabulary.module";
import { LearnerRecapController } from "./learner-recap.controller";
import { LearnerRecapGeminiClient } from "./learner-recap-gemini.client";
import { LearnerRecapService } from "./learner-recap.service";

@Module({
  imports: [AuthModule, UserVocabularyModule],
  controllers: [LearnerRecapController],
  providers: [LearnerRecapService, LearnerRecapGeminiClient],
  exports: [LearnerRecapService],
})
export class LearnerRecapModule {}
