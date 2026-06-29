import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { StudyingPlanRegenerationService } from "src/studying-plan/studying-plan-regeneration.service";
import {
  map_user_profile_response,
  userProfileInclude,
} from "./user-profile.mapper";

@Injectable()
export class AuthProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studyingPlanRegeneration: StudyingPlanRegenerationService,
  ) { }

  async get_profile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ...userProfileInclude,
        achievements: {
          select: { achievementId: true }
        }
      }
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isSuspended) {
      throw new ForbiddenException("Account suspended");
    }
    const [distinctPassedVideos, vocabularyTermsTotal, studyingPlanPhaseTopics] =
      await Promise.all([
        this.prisma.comprehensionTestAttempt
          .findMany({
            where: { userId, passed: true },
            distinct: ["contentVideoId"],
            select: { contentVideoId: true },
          })
          .then((rows) => rows.length),
        this.prisma.userVocabulary.count({ where: { userId } }),
        this.studyingPlanRegeneration.resolvePhaseTopicsForUser(userId),
      ]);
    return map_user_profile_response(user, {
      distinctPassedVideos,
      vocabularyTermsTotal,
      studyingPlanPhaseTopics,
    });
  }
}
