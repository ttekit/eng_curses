import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { ContentVideoModule } from "src/content/content-video/content-video.module";
import { ContentsController } from "./contents.controller";
import { ContentsService } from "./contents.service";
import { ContentsDeadlineCron } from "./contents-deadline.cron";

// Sitemap is served by SeoModule (`GET /sitemap.xml`).

@Module({
  imports: [AuthModule, ContentVideoModule],
  controllers: [ContentsController],
  providers: [ContentsService, ContentsDeadlineCron],
})
export class ContentsModule {}
