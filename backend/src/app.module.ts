import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AlcorythmModule } from "./alcorythm/alcorythm.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { ContentMediaModule } from "./content/content-media/content-media.module";
import { ContentStatsModule } from "./content/content-stats/content-stats.module";
import { ContentVideoModule } from "./content/content-video/content-video.module";
import { ContentRecommendationsModule } from "./content-recommendations/content-recommendations.module";
import { ContentsModule } from "./contents/contents.module";
import { PrismaModule } from "./prisma.module";
import { TagsModule } from "./tags/tags.module";
import { TopicsModule } from "./topics/topics.module";
import { UsersModule } from "./users/users.module";
import { GlobalApiTokenGuard } from "./auth/global-api-token.guard";
import { RequireActiveSubscriptionGuard } from "./auth/guards/require-active-subscription.guard";
import { PhaseFinalTestModule } from "./phase-final-test/phase-final-test.module";
import { PlacementTestModule } from "./placement-test/placement-test.module";
import { AdminAnalyticsModule } from "./admin-analytics/admin-analytics.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { TeacherStudentsModule } from "./teacher-students/teacher-students.module";
import { BillingModule } from "./billing/billing.module";
import { LearnerRecapModule } from "./learner-recap/learner-recap.module";
import { ProfileModule } from "./profile/profile.module";
import { RedisModule } from "./redis/redis.module";
import { SeoModule } from "./seo/seo.module";
import { AvatarsModule } from "./avatars/avatars.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContentsModule,
    ContentVideoModule,
    ContentRecommendationsModule,
    ContentStatsModule,
    ContentMediaModule,
    AlcorythmModule,
    TagsModule,
    CategoriesModule,
    TopicsModule,
    PlacementTestModule,
    PhaseFinalTestModule,
    AdminAnalyticsModule,
    AdminUsersModule,
    TeacherStudentsModule,
    BillingModule,
    LearnerRecapModule,
    ProfileModule,
    RedisModule,
    SeoModule,
    AvatarsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RequireActiveSubscriptionGuard },
    { provide: APP_GUARD, useClass: GlobalApiTokenGuard },
  ],
})
export class AppModule { }
