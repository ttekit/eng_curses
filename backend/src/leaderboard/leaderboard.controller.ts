import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { LeaderboardService } from "./leaderboard.service";

@ApiTags("leaderboard")
@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary:
      "Top learners by count of completed videos with best quiz score ≥ 80%",
  })
  @ApiResponse({ status: 200, description: "Leaderboard rows returned." })
  get_leaderboard(@Req() req: Request & { user: unknown }) {
    const userId = jwtSubToUserId(req.user);
    return this.leaderboard.get_leaderboard(userId);
  }
}
