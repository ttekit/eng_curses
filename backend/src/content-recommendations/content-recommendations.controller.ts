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
    summary: "Rank videos for a user",
    description:
      "Uses user CEFR (englishLevel), per-topic knowledge as vocabulary strength, " +
      "hobbies/interests/selected topics vs video theme tags, video CEFR and processing complexity, " +
      "and topic overlap when the video is linked to topics on ContentStats.",
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
