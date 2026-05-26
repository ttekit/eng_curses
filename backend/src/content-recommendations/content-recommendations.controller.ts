import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { ContentRecommendationsService } from "./content-recommendations.service";

@ApiTags("content-recommendations")
@Controller("content-recommendations")
export class ContentRecommendationsController {
  constructor(
    private readonly contentRecommendationsService: ContentRecommendationsService,
  ) {}

  @Get("for-user/:userId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Rank videos for a user (deterministic, no AI)",
    description:
      "Rule-based ranking: blended profile + active studying-plan phase CEFR, " +
      "phase catalogue topics, per-topic knowledge scores, hobbies/job/work field, " +
      "favorite and hated genres vs video userTags, and video CEFR / processing complexity.",
  })
  @ApiParam({ name: "userId", type: "integer" })
  forUser(
    @Param("userId", ParseIntPipe) userId: number,
    @Req() req: Request & { user?: any },
  ) {
    const authUserId = jwtSubToUserId(req.user);

    if (authUserId !== userId && req.user?.role !== "ADMIN") {
      throw new ForbiddenException(
        "You are not allowed to view recommendations for other users",
      );
    }

    return this.contentRecommendationsService.getRecommendationsForUser(userId);
  }
}
