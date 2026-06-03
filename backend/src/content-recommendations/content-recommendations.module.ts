import { Module } from '@nestjs/common';
import { ContentRecommendationsController } from './content-recommendations.controller';
import { ContentRecommendationsService } from './content-recommendations.service';
import { AuthModule } from 'src/auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [ContentRecommendationsController],
  providers: [ContentRecommendationsService],
  exports: [ContentRecommendationsService],
})
export class ContentRecommendationsModule {}