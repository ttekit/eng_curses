import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { AuthGuard } from "src/auth/auth.guard";
import type { AuthedRequest } from "src/auth/authenticated-request.types";
import { resolve_authed_user_id } from "src/auth/jwt-subject.util";

@Controller("profile")
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get("learning-stats")
  async getLearningStats(@Req() req: AuthedRequest) {
    const userId = resolve_authed_user_id(req.user);
    return this.profileService.getLearningStats(userId);
  }

  @Get("activity-log")
  async getActivityLog(@Req() req: AuthedRequest) {
    const userId = resolve_authed_user_id(req.user);
    return this.profileService.getActivityLog(userId);
  }

  @Get("progress-details")
  async getProgressDetails(@Req() req: AuthedRequest) {
    const userId = resolve_authed_user_id(req.user);
    return this.profileService.getProgressDetails(userId);
  }

  @Get("vocabulary-stats")
  async getVocabularyStats(@Req() req: AuthedRequest) {
    return this.profileService.getVocabularyStats(
      resolve_authed_user_id(req.user),
    );
  }
}
