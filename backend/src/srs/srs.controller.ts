import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { RecommendationEngineService } from "src/recommendation-engine/recommendation-engine.service";
import { parse_exclude_segment_ids } from "src/recommendation-engine/feed-query.util";
import { ContextShiftDto, WatchFeedbackDto } from "./dto/feed-feedback.dto";
import { ProgressInteractDto } from "./dto/progress-interact.dto";
import { FeedGeneratorService } from "./feed-generator.service";
import { SpacedRepetitionService } from "./spaced-repetition.service";
import { SubtitleIngestionService } from "./subtitle-ingestion.service";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";

@Controller("progress")
export class ProgressController {
  constructor(
    private readonly spacedRepetitionService: SpacedRepetitionService,
  ) {}

  @Post("interact")
  @UseGuards(AuthGuard)
  async interact(
    @Body() body: ProgressInteractDto,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.spacedRepetitionService.interact({
      userId,
      wordId: body.wordId,
      isCorrect: body.isCorrect,
      timeSinceLastReview: body.timeSinceLastReview,
    });
  }

  @Get("due-count")
  @UseGuards(AuthGuard)
  async due_count(@Req() req: Request & { user: unknown }) {
    const userId = jwtSubToUserId(req.user);
    const count = await this.spacedRepetitionService.get_due_count(userId);
    return { count };
  }
}

@Controller("feed")
export class FeedController {
  constructor(
    private readonly feedGeneratorService: FeedGeneratorService,
    private readonly recommendationEngineService: RecommendationEngineService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async get_feed(
    @Req() req: Request & { user: unknown },
    @Query("limit") limitRaw?: string,
    @Query("exclude") excludeRaw?: string,
  ) {
    const userId = jwtSubToUserId(req.user);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(limitRaw ?? "20", 10) || 20),
    );
    const excludeSegmentIds = parse_exclude_segment_ids(excludeRaw);
    return this.feedGeneratorService.generate_feed(
      userId,
      limit,
      excludeSegmentIds,
    );
  }

  @Post("context-shift")
  @UseGuards(AuthGuard)
  async context_shift(
    @Body() body: ContextShiftDto,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.recommendationEngineService.handle_context_shift(
      userId,
      body.segmentId,
      body.word,
    );
  }

  @Post("watch-feedback")
  @UseGuards(AuthGuard)
  async watch_feedback(
    @Body() body: WatchFeedbackDto,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.recommendationEngineService.process_watch_feedback(
      userId,
      body.segmentId,
      body.watchTimeSec,
      body.loopLengthSec,
    );
  }

  @Post(":segmentId/seen")
  @UseGuards(AuthGuard)
  async mark_seen(
    @Param("segmentId", ParseIntPipe) segmentId: number,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    await this.feedGeneratorService.mark_segment_seen(userId, segmentId);
    return { ok: true };
  }
}

@Controller("admin/content-video")
export class SrsAdminController {
  constructor(
    private readonly subtitleIngestionService: SubtitleIngestionService,
  ) {}

  @Post(":id/ingest-segments")
  @UseGuards(JwtAdminGuard)
  async ingest_segments(@Param("id", ParseIntPipe) id: number) {
    return this.subtitleIngestionService.ingest_for_video(id);
  }
}
