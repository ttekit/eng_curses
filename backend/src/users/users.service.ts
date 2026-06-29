import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AdminUpdateUserDto, UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { parseStudyingPlanV2Strict } from "../studying-plan/studying-plan-json.util";
import { AlcorythmService } from "../alcorythm/alcorythm.service";
import { Prisma } from "../generated/prisma/client";
import type { AuthMethod } from "@generated/prisma/enums";
import { UserRole } from "@generated/prisma/enums";
import { ResetProgressDto } from "./dto/reset-progress.dto";
import { MailService } from "src/common/mail/mail.service";

function parseRoleFromDto(roleRaw: string | undefined): UserRole | undefined {
  if (roleRaw == null || typeof roleRaw !== "string") {
    return undefined;
  }
  const k = roleRaw.trim().toUpperCase();
  if (k === "ADULT") return UserRole.ADULT;
  if (k === "STUDENT") return UserRole.STUDENT;
  if (k === "TEACHER") return UserRole.TEACHER;
  if (k === "ADMIN") return UserRole.ADMIN;
  return undefined;
}

function resolveAuthMethodForCreate(dto: CreateUserDto): AuthMethod {
  const raw = String(dto.method ?? "")
    .trim()
    .toUpperCase();
  return raw === "GOOGLE" ? "GOOGLE" : "CREDENTIALS";
}

function clampPhaseIndex(index: number, phaseCount: number): number {
  if (phaseCount <= 0) return 0;
  return Math.max(0, Math.min(Math.floor(index), phaseCount - 1));
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly alcorythmService: AlcorythmService,
    private readonly mailService: MailService,
  ) { }

  private readonly userSelect = {
    id: true,
    name: true,
    email: true,
    dateOfBirth: true,
    avatarUrl: true,
    role: true,
    isSuspended: true,
    hasCompletedPlacement: true,
    createdAt: true,
    xp: true,
    currentStreak: true,
    achievements: {
      select: { achievementId: true },
    },
    additionalUserData: {
      select: {
        englishLevel: true,
        nativeLanguage: true,
        knownLanguages: true,
        knownLanguageLevels: true,
        hobbies: true,
        education: true,
        workField: true,
        job: true,
        interests: true,
        teacherGrades: true,
        teacherTopics: true,
        studentNames: true,
        studentGrade: true,
        studentProblemTopics: true,
        learningGoal: true,
        timeToAchieve: true,
        studyingPlanPhases: true,
        activeStudyingPhaseIndex: true,
        favoriteGenres: true,
        hatedGenres: true,
      },
    },
    settings: {
      select: {
        playbackSpeed: true,
        currentResolution: true,
      },
    },
    class: {
      select: { name: true },
    },
    teacher: {
      select: { name: true },
    },
  };

  async create(createUserDto: CreateUserDto) {
    const prisma = this.prisma as any;
    const {
      email,
      password,
      name,
      role: roleRaw,
      englishLevel,
      hobbies,
      education,
      workField,
      favoriteGenres,
      hatedGenres,
      nativeLanguage,
      knownLanguages,
      knownLanguageLevels,
      learningGoal,
      timeToAchieve,
      studyingPlanPhases,
      activeStudyingPhaseIndex,
    } = createUserDto;

    const isDomainValid = await this.mailService.validateEmailDomain(email);
    if (!isDomainValid) {
      throw new BadRequestException(
        "The provided email domain does not exist or cannot receive mail.",
      );
    }

    const role = parseRoleFromDto(roleRaw);
    const resolvedAuthMethod = resolveAuthMethodForCreate(createUserDto);
    const additionalDataPayload: any = {
      englishLevel,
      nativeLanguage,
      knownLanguages: knownLanguages || [],
      knownLanguageLevels,
      hobbies: hobbies || [],
      education,
      workField,
      learningGoal,
      timeToAchieve,
      ...(() => {
        if (studyingPlanPhases === undefined || studyingPlanPhases === null) {
          return {};
        }
        try {
          const plan = parseStudyingPlanV2Strict(studyingPlanPhases);
          return {
            studyingPlanPhases: JSON.parse(
              JSON.stringify(plan),
            ) as Prisma.InputJsonValue,
            activeStudyingPhaseIndex: clampPhaseIndex(
              activeStudyingPhaseIndex ?? 0,
              plan.phases.length,
            ),
          };
        } catch {
          throw new BadRequestException(
            "Invalid studying plan (version 2 with tasks required)",
          );
        }
      })(),
      favoriteGenres:
        favoriteGenres && favoriteGenres.length > 0
          ? {
            connect: favoriteGenres.map((id) => ({ id })),
          }
          : undefined,
      hatedGenres:
        hatedGenres && hatedGenres.length > 0
          ? {
            connect: hatedGenres.map((id) => ({ id })),
          }
          : undefined,
    };

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      throw new BadRequestException(
        "Unable to create user with the provided information",
      );
    }

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const coreUserFields = {
      email,
      name,
      password: hashedPassword,
      ...(role ? { role } : {}),
      dateOfBirth: createUserDto.dateOfBirth
        ? new Date(createUserDto.dateOfBirth)
        : null,
      hasCompletedPlacement: role === "TEACHER" || role === "ADMIN",
      subscriptionPlan: "smart",
      subscriptionStatus: "active",
    };

    let created: any;
    try {
      created = await prisma.user.create({
        data: {
          ...coreUserFields,
          method: resolvedAuthMethod,
          additionalUserData: {
            create: additionalDataPayload,
          },
        },
        select: this.userSelect,
      });
    } catch (error: any) {
      const message = String(error?.message ?? "");
      if (message.includes("Unknown argument `knownLanguages`")) {
        delete additionalDataPayload.knownLanguages;
      }
      if (message.includes("Unknown argument `knownLanguageLevels`")) {
        delete additionalDataPayload.knownLanguageLevels;
      }
      if (
        message.includes("Unknown argument `knownLanguages`") ||
        message.includes("Unknown argument `knownLanguageLevels`")
      ) {
        created = await prisma.user.create({
          data: {
            ...coreUserFields,
            method: resolvedAuthMethod,
            additionalUserData: { create: additionalDataPayload },
          },
          select: this.userSelect,
        });
        await this.alcorythmService.analyzeUserLevel(created.id);
        return {
          ...created,
          className: created.class?.name ?? null,
          teacherName: created.teacher?.name ?? null,
        };
      }

      if (error?.code !== "P2021") {
        throw error;
      }

      created = await prisma.user.create({
        data: {
          ...coreUserFields,
          method: resolvedAuthMethod,
        },
        select: this.userSelect,
      });
    }

    await this.alcorythmService.analyzeUserLevel(created.id);
    return {
      ...created,
      className: created.class?.name ?? null,
      teacherName: created.teacher?.name ?? null,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: this.userSelect,
    });
    return users.map((user) => ({
      ...user,
      className: (user as any).class?.name ?? null,
      teacherName: (user as any).teacher?.name ?? null,
    }));
  }

  async findById(id: number) {
    const prisma = this.prisma as any;

    const user = await prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const firstWatchSession = await prisma.watchSession.findFirst({
      where: { userId: id },
      orderBy: { id: "asc" },
      include: {
        contentVideo: {
          select: {
            id: true,
            videoName: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    const firstWatchedVideo = firstWatchSession?.contentVideo
      ? {
        id: firstWatchSession.contentVideo.id,
        videoName: firstWatchSession.contentVideo.videoName,
        thumbnailUrl: firstWatchSession.contentVideo.thumbnailUrl,
        url: `/content/${firstWatchSession.contentVideo.friendlyLink || firstWatchSession.contentVideo.id}`,
      }
      : null;

    return {
      ...user,
      className: user.class?.name ?? null,
      teacherName: user.teacher?.name ?? null,
      firstWatchedVideo,
    };
  }

  async findOne(id: number) {
    return this.findById(id);
  }

  async FindByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        accounts: true,
      },
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const prisma = this.prisma as any;
    await this.findById(id);

    if ((updateUserDto as any).email) {
      const isDomainValid = await this.mailService.validateEmailDomain(
        (updateUserDto as any).email,
      );
      if (!isDomainValid) {
        throw new BadRequestException(
          "The provided email domain does not exist or cannot receive mail.",
        );
      }
    }

    const {
      favoriteGenres,
      hatedGenres,
      englishLevel,
      hobbies,
      education,
      workField,
      nativeLanguage,
      knownLanguages,
      knownLanguageLevels,
      learningGoal,
      timeToAchieve,
      playbackSpeed,
      currentResolution,
      ...dataToUpdate
    } = updateUserDto as any;

    if (dataToUpdate.role !== undefined && dataToUpdate.role !== null) {
      const coerced = parseRoleFromDto(String(dataToUpdate.role));
      if (coerced !== undefined) {
        dataToUpdate.role = coerced;
      } else {
        delete dataToUpdate.role;
      }
    }

    if (dataToUpdate.dateOfBirth !== undefined) {
      dataToUpdate.dateOfBirth = dataToUpdate.dateOfBirth
        ? new Date(dataToUpdate.dateOfBirth)
        : null;
    }

    if (
      dataToUpdate.password !== undefined &&
      dataToUpdate.password !== null &&
      String(dataToUpdate.password).trim() !== ""
    ) {
      dataToUpdate.password = await bcrypt.hash(
        String(dataToUpdate.password),
        10,
      );
    } else {
      delete dataToUpdate.password;
    }

    const hasProfileUpdate =
      englishLevel !== undefined ||
      hobbies !== undefined ||
      education !== undefined ||
      workField !== undefined ||
      nativeLanguage !== undefined ||
      knownLanguages !== undefined ||
      knownLanguageLevels !== undefined ||
      learningGoal !== undefined ||
      timeToAchieve !== undefined ||
      favoriteGenres !== undefined ||
      hatedGenres !== undefined;

    const hasSettingsRowUpdate =
      playbackSpeed !== undefined || currentResolution !== undefined;

    const settingsUpsert = hasSettingsRowUpdate
      ? {
        settings: {
          upsert: {
            create: {
              playbackSpeed:
                playbackSpeed === undefined ? null : Number(playbackSpeed),
              currentResolution:
                currentResolution === undefined
                  ? null
                  : String(currentResolution),
            },
            update: {
              ...(playbackSpeed !== undefined
                ? {
                  playbackSpeed: Number(playbackSpeed),
                }
                : {}),
              ...(currentResolution !== undefined
                ? {
                  currentResolution: String(currentResolution),
                }
                : {}),
            },
          },
        },
      }
      : {};

    let updatedUser: any;
    try {
      updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...dataToUpdate,
          ...settingsUpsert,
          ...(hasProfileUpdate
            ? {
              additionalUserData: {
                upsert: {
                  create: {
                    englishLevel,
                    nativeLanguage,
                    knownLanguages: knownLanguages || [],
                    knownLanguageLevels,
                    hobbies: hobbies || [],
                    education,
                    workField,
                    learningGoal,
                    timeToAchieve,
                    favoriteGenres: favoriteGenres
                      ? {
                        connect: favoriteGenres.map((genreId: number) => ({
                          id: genreId,
                        })),
                      }
                      : undefined,
                    hatedGenres: hatedGenres
                      ? {
                        connect: hatedGenres.map((genreId: number) => ({
                          id: genreId,
                        })),
                      }
                      : undefined,
                  },
                  update: {
                    englishLevel,
                    nativeLanguage,
                    knownLanguages,
                    knownLanguageLevels,
                    hobbies,
                    education,
                    workField,
                    learningGoal,
                    timeToAchieve,
                    favoriteGenres: favoriteGenres
                      ? {
                        set: favoriteGenres.map((genreId: number) => ({
                          id: genreId,
                        })),
                      }
                      : undefined,
                    hatedGenres: hatedGenres
                      ? {
                        set: hatedGenres.map((genreId: number) => ({
                          id: genreId,
                        })),
                      }
                      : undefined,
                  },
                },
              },
            }
            : {}),
        },
        select: this.userSelect,
      });
    } catch (error: any) {
      if (error?.code !== "P2021") {
        throw error;
      }

      updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...dataToUpdate,
          ...settingsUpsert,
        },
        select: this.userSelect,
      });
    }

    if (
      englishLevel !== undefined ||
      hobbies !== undefined ||
      education !== undefined ||
      workField !== undefined ||
      nativeLanguage !== undefined ||
      knownLanguages !== undefined ||
      knownLanguageLevels !== undefined ||
      learningGoal !== undefined ||
      timeToAchieve !== undefined ||
      favoriteGenres !== undefined ||
      hatedGenres !== undefined
    ) {
      await this.alcorythmService.analyzeUserLevel(id);
    }

    return {
      ...updatedUser,
      className: updatedUser.class?.name ?? null,
      teacherName: updatedUser.teacher?.name ?? null,
    };
  }

  async remove(id: number) {
    await this.findById(id);

    await this.prisma.account.deleteMany({
      where: { userId: id },
    });

    return this.prisma.user.delete({
      where: { id },
      select: this.userSelect,
    });
  }

  async updateActivityStreak(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastActivityDate: true },
    });

    if (!user) return null;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let newStreak = user.currentStreak ?? 0;

    if (!user.lastActivityDate) {
      newStreak = newStreak > 0 ? newStreak + 1 : 1;
    } else {
      const lastActivityStr = new Date(user.lastActivityDate)
        .toISOString()
        .split("T")[0];

      if (todayStr === lastActivityStr) {
        if (newStreak === 0) {
          newStreak = 1;
        } else {
          return this.prisma.user.update({
            where: { id: userId },
            data: { lastActivityDate: now },
          });
        }
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActivityStr === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        lastActivityDate: now,
      },
    });
  }

  async resetProgress(userId: number, dto: ResetProgressDto) {
    const prisma = this.prisma as any;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        verificationCode: true,
        verificationCodeExpires: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`The user with ID ${userId} was not found.`);
    }

    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new BadRequestException(
        "Invalid verification code. Action canceled.",
      );
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException(
        "Verification code has expired. Please request a new one.",
      );
    }

    return prisma.$transaction([
      prisma.watchSession.deleteMany({ where: { userId } }),
      prisma.comprehensionTestAttempt.deleteMany({ where: { userId } }),
      prisma.userComprehensionWeakSpot.deleteMany({ where: { userId } }),
      prisma.userVocabulary.deleteMany({ where: { userId } }),
      prisma.userLanguageData.deleteMany({ where: { userId } }),
      prisma.userAchievement.deleteMany({ where: { userId } }),
      prisma.postWatchSurvey.deleteMany({ where: { userId } }),

      prisma.userStatistic.upsert({
        where: { userId },
        update: { studyingProgress: 0, learnedAmount: 0, lastLesson: null },
        create: { userId, studyingProgress: 0, learnedAmount: 0 },
      }),

      prisma.user.update({
        where: { id: userId },
        data: {
          xp: 0,
          level: 1,
          currentStreak: 0,
          comprehensionWrongBank: 0,
          errorFixingTestPending: false,
          weeklyReviewCompletedWeekStart: null,
          weeklyReviewLastScorePct: null,
          monthlyReviewCompletedMonth: null,
          monthlyReviewLastScorePct: null,
          mistakesPracticeCompletedAt: null,
          verificationCode: null,
          verificationCodeExpires: null,
        },
      }),
    ]);
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto) {
    const {
      role: _privilegedRole,
      isSuspended: _privilegedSuspended,
      ...safeData
    } = updateUserDto as UpdateUserDto & {
      role?: string;
      isSuspended?: boolean;
    };

    const profilePatch: UpdateUserDto = { ...safeData };

    return this.update(id, profilePatch);
  }

  async updateAsAdmin(
    id: number,
    updateUserDto: UpdateUserDto | AdminUpdateUserDto,
  ) {
    return this.update(id, updateUserDto as UpdateUserDto);
  }
}
