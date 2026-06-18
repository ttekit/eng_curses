import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AlcorythmService } from "../alcorythm/alcorythm.service";
import { UsersService } from "src/users/users.service";
import { AuthMethod, User } from "@generated/prisma/client";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ProviderService } from "./provider/provider.service";
import { EmailConfirmationService } from "./email-confirmation/email-confirmation.service";
import { TwoFactorAuthService } from "./two-factor-auth/two-factor-auth.service";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { isOutboundMailDisabled } from "src/common/utils/outbound-mail-disabled.util";
import { MailService } from "src/common/mail/mail.service";
import { v4 as uuidv4 } from "uuid";
import { randomInt } from "crypto";
import { generateSecurePassword } from "src/common/utils/password.util";
import { AuthProfileService } from "./auth-profile.service";
import { AuthLearningStatsService } from "./auth-learning-stats.service";
import { AuthKnowledgeTagsService } from "./auth-knowledge-tags.service";
import { AuthProgressDetailsService } from "./auth-progress-details.service";
import { SaveWordDto } from "./dto/save-word.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import type { OAuthCallbackResult } from "./oauth-callback.types";

export interface GeneratedStudent {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly alcorythmService: AlcorythmService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly mailService: MailService,
    private readonly authProfileService: AuthProfileService,
    private readonly authLearningStatsService: AuthLearningStatsService,
    private readonly authKnowledgeTagsService: AuthKnowledgeTagsService,
    private readonly authProgressDetailsService: AuthProgressDetailsService,
  ) {}

  private async filterExistingGenreIds(
    ids: number[] | undefined,
  ): Promise<number[]> {
    if (!ids?.length) {
      return [];
    }
    const numericUnique = [
      ...new Set(
        ids
          .map((raw) => {
            const n =
              typeof raw === "number" && Number.isFinite(raw)
                ? Math.trunc(raw)
                : parseInt(String(raw).trim(), 10);
            return Number.isFinite(n) && n > 0 ? n : NaN;
          })
          .filter((n): n is number => !Number.isNaN(n)),
      ),
    ];
    if (!numericUnique.length) {
      return [];
    }
    const rows = await this.prisma.genre.findMany({
      where: { id: { in: numericUnique } },
      select: { id: true },
    });
    return rows.map((g) => g.id);
  }

  private pickDefinedFields(
    record: Record<string, unknown>,
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(record).filter(([, v]) => v !== undefined),
    );
  }

  private async generateStudentAccount(
    pupil: any,
    teacherId: number,
  ): Promise<GeneratedStudent> {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    let firstName = "student";
    let lastName = randomId.toString();

    if (typeof pupil === "object" && pupil !== null) {
      firstName = pupil.name || "student";
      lastName = pupil.surname || randomId.toString();
    } else if (typeof pupil === "string") {
      const parts = pupil.split(" ");
      firstName = parts[0] || "student";
      lastName = parts[1] || randomId.toString();
    }

    const studentEmail =
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomId}@explys.com`.replace(
        /\s+/g,
        "",
      );

    const tempPassword = generateSecurePassword(16);
    const hashedStudentPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.create({
      data: {
        email: studentEmail.toLowerCase(),
        password: hashedStudentPassword,
        name: `${firstName} ${lastName}`.trim(),
        role: "STUDENT",
        method: "CREDENTIALS",
        teacherId,
        isVerified: true,
        subscriptionPlan: "smart",
        subscriptionStatus: "active",
      },
    });

    return {
      name: `${firstName} ${lastName}`.trim(),
      email: studentEmail,
      password: tempPassword,
    };
  }

  async register(req: Request, dto: RegisterDto) {
    const isDomainValid = await this.mailService.validateEmailDomain(dto.email);
    if (!isDomainValid) {
      throw new BadRequestException(
        "The provided email domain does not exist or cannot receive mail.",
      );
    }
    const prisma = this.prisma as any;
    const outboundMailDisabled = isOutboundMailDisabled(this.configService);

    const userExists = await this.userService.FindByEmail(
      dto.email.toLowerCase(),
    );

    if (userExists) {
      throw new ConflictException(
        "User with this email already exists. Please use another email or log in",
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const trimmedLearningGoal =
      typeof dto.learningGoal === "string" ? dto.learningGoal.trim() : "";
    const trimmedTimeToAchieve =
      typeof dto.timeToAchieve === "string" ? dto.timeToAchieve.trim() : "";

    const favoriteGenreIds = await this.filterExistingGenreIds(
      dto.favoriteGenres,
    );
    const hatedGenreIds = await this.filterExistingGenreIds(dto.hatedGenres);

    const additionalDataPayload: Record<string, unknown> = {
      englishLevel: dto.englishLevel,
      education: dto.education,
      hobbies: dto.hobbies || [],
      workField: dto.workField,
      nativeLanguage: dto.nativeLanguage,
      knownLanguages: dto.knownLanguages || [],
      knownLanguageLevels: dto.knownLanguageLevels,
      teacherGrades: dto.teacherGrades,
      teacherTopics: dto.teacherTopics || [],
      studentGrade: dto.studentGrade,
      studentProblemTopics: dto.studentProblemTopics || [],
      studentNames: dto.studentNames,
      learningGoal: trimmedLearningGoal || null,
      timeToAchieve: trimmedTimeToAchieve || null,
    };

    const allowedRegisterRoles = new Set(["ADULT", "STUDENT", "TEACHER"]);
    const requestedRole = String(dto.role ?? "")
      .trim()
      .toUpperCase();
    const roleLabel = allowedRegisterRoles.has(requestedRole)
      ? requestedRole
      : "REGULAR";

    let otpCode: string | null = null;
    let otpExpires: Date | null = null;

    if (!outboundMailDisabled) {
      otpCode = randomInt(100000, 1000000).toString();
      otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    }

    const isVerifiedOnCreate = outboundMailDisabled;

    const mainUser = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: roleLabel as any,
        method: "CREDENTIALS",
        isVerified: isVerifiedOnCreate,
        verificationCode: otpCode,
        verificationCodeExpires: otpExpires,
        subscriptionPlan: "smart",
        subscriptionStatus: "active",
        hasCompletedPlacement: roleLabel === "TEACHER",
        additionalUserData: {
          create: this.pickDefinedFields(additionalDataPayload) as Record<
            string,
            unknown
          >,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        verificationCode: true,
      },
    });

    if (favoriteGenreIds.length > 0 || hatedGenreIds.length > 0) {
      const genreUpdate: Record<string, unknown> = {};
      if (favoriteGenreIds.length > 0) {
        genreUpdate.favoriteGenres = {
          connect: favoriteGenreIds.map((id) => ({ id })),
        };
      }
      if (hatedGenreIds.length > 0) {
        genreUpdate.hatedGenres = {
          connect: hatedGenreIds.map((id) => ({ id })),
        };
      }
      await prisma.additionalUserData.update({
        where: { userId: mainUser.id },
        data: genreUpdate as Record<string, unknown>,
      });
    }

    const generatedStudents: GeneratedStudent[] = [];

    if (dto.role === "teacher" && Array.isArray(dto.studentNames)) {
      for (const pupil of dto.studentNames) {
        const student = await this.generateStudentAccount(pupil, mainUser.id);
        generatedStudents.push(student);
      }
    }

    if (!outboundMailDisabled) {
      await this.emailConfirmationService.sendVerificationToken(mainUser);
    }

    const payload = { sub: mainUser.id, email: mainUser.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      isVerified: isVerifiedOnCreate,
      user: {
        id: mainUser.id,
        email: mainUser.email,
        name: mainUser.name,
      },
      generatedStudents:
        generatedStudents.length > 0 ? generatedStudents : undefined,
      message: outboundMailDisabled
        ? "You have successfully registered."
        : "Account created. A confirmation code was sent to your email—you can confirm anytime, but it is not required to continue.",
    };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }
    if (user.deletionScheduledAt) {
      if (user.deletionScheduledAt > new Date()) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { deletionScheduledAt: null },
        });

        await this.prisma.token.deleteMany({
          where: { email: user.email, type: "ACCOUNT_RESTORE" },
        });
      } else {
        throw new UnauthorizedException("The account has been deleted.");
      }
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.isSuspended) {
      throw new ForbiddenException("Account suspended");
    }

    if (user.isTwoFactorEnable) {
      if (!dto.code) {
        await this.twoFactorAuthService.sendTwoFactorToken(user.email);

        return {
          requiresTwoFactor: true,
          email: user.email,
          message:
            "Please check your email. Two-factor authentication code is required.",
        };
      }

      await this.twoFactorAuthService.validateTwoFactorToken(
        user.email,
        dto.code,
      );
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
        hasCompletedPlacement: user.hasCompletedPlacement,

        subscriptionPlan: user.subscriptionPlan ?? "",
        subscriptionStatus: user.subscriptionStatus ?? "",
        stripeSubscriptionId: user.stripeSubscriptionId ?? "",
      },
    };
  }

  async updateUserPreferences(userId: number, data: UpdatePreferencesDto) {
    const prisma = this.prisma as any;
    const generatedStudents: GeneratedStudent[] = [];

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { additionalUserData: true },
    });

    const hasExistingStudents =
      Array.isArray(currentUser?.additionalUserData?.studentNames) &&
      currentUser.additionalUserData.studentNames.length > 0;

    if (
      data.role === "TEACHER" &&
      Array.isArray(data.studentNames) &&
      !hasExistingStudents
    ) {
      for (const pupil of data.studentNames) {
        const student = await this.generateStudentAccount(pupil, userId);
        generatedStudents.push(student);
      }
    }

    const baseData: any = {};
    if (data.teacherGrades !== undefined)
      baseData.teacherGrades = data.teacherGrades;
    if (data.teacherTopics !== undefined) {
      baseData.teacherTopics = Array.isArray(data.teacherTopics)
        ? data.teacherTopics.map((t: any) => String(t))
        : data.teacherTopics;
    }
    if (data.studentNames !== undefined)
      baseData.studentNames = data.studentNames;
    if (data.learningGoal !== undefined)
      baseData.learningGoal = data.learningGoal;
    if (data.timeToAchieve !== undefined)
      baseData.timeToAchieve = data.timeToAchieve;
    if (data.hobbies !== undefined) baseData.hobbies = data.hobbies;
    if (data.education !== undefined) baseData.education = data.education;
    if (data.workField !== undefined) baseData.workField = data.workField;
    if (data.nativeLanguage !== undefined)
      baseData.nativeLanguage = data.nativeLanguage;
    if (data.knownLanguages !== undefined)
      baseData.knownLanguages = data.knownLanguages;

    const createData: any = { ...baseData };
    const updateData: any = { ...baseData };

    if (data.favoriteGenres) {
      const favoriteGenreIds = await this.filterExistingGenreIds(
        data.favoriteGenres,
      );
      if (favoriteGenreIds.length > 0) {
        const mappedIds = favoriteGenreIds.map((id: number) => ({ id }));
        createData.favoriteGenres = { connect: mappedIds };
        updateData.favoriteGenres = { set: mappedIds };
      }
    }

    if (data.hatedGenres) {
      const hatedGenreIds = await this.filterExistingGenreIds(data.hatedGenres);
      if (hatedGenreIds.length > 0) {
        const mappedIds = hatedGenreIds.map((id: number) => ({ id }));
        createData.hatedGenres = { connect: mappedIds };
        updateData.hatedGenres = { set: mappedIds };
      }
    }

    const hasAdditionalData = Object.keys(updateData).length > 0;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role && data.role.toUpperCase() !== "CHOOSE"
          ? { role: data.role.toUpperCase() as any }
          : {}),
        ...(data.dateOfBirth
          ? { dateOfBirth: new Date(data.dateOfBirth) }
          : {}),

        additionalUserData: hasAdditionalData
          ? {
              upsert: {
                create: createData,
                update: updateData,
              },
            }
          : undefined,
      },
    });

    return {
      ...updatedUser,
      generatedStudents:
        generatedStudents.length > 0 ? generatedStudents : undefined,
    };
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ): Promise<OAuthCallbackResult> {
    const providerInstance = this.providerService.findByService(provider);

    if (!providerInstance) {
      throw new NotFoundException(`Provider ${provider} not found`);
    }

    const profile = await providerInstance.findUserByCode(code);
    const email = profile.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const linked = await this.prisma.account.findFirst({
        where: { userId: existingUser.id, provider: profile.provider },
      });

      if (!linked) {
        await this.prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider: profile.provider,
            accessToken: profile.access_token,
            refreshToken: profile.refresh_token ?? null,
            expiresAt: profile.expires_at ?? 0,
          },
        });
      }

      const full = await this.userService.findById(existingUser.id);

      const payload = { sub: full.id, email: full.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: full,
        isNewUser: false,
      };
    }

    const oauthMethod =
      profile.provider.toLowerCase() === "google"
        ? AuthMethod.GOOGLE
        : AuthMethod.CREDENTIALS;

    const created = await this.userService.create({
      email,
      password: "",
      name: profile.name,
      picture: profile.picture,
      method: oauthMethod,
    });

    await this.prisma.user.update({
      where: { id: created.id },
      data: { isVerified: true },
    });

    await this.prisma.account.create({
      data: {
        userId: created.id,
        type: "oauth",
        provider: profile.provider,
        accessToken: profile.access_token,
        refreshToken: profile.refresh_token ?? null,
        expiresAt: profile.expires_at ?? 0,
      },
    });

    const payload = { sub: created.id, email: created.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: created,
      isNewUser: true,
    };
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              "'Could not end the session. Either the server is unreachable or the session is already invalid.'",
            ),
          );
        }
        res.clearCookie(this.configService.getOrThrow<string>("SESSION_NAME"));

        resolve();
      });
    });
  }

  async saveWordToVocabulary(userId: number, body: SaveWordDto) {
    if (!body.term) {
      throw new BadRequestException("Term is required");
    }
    const language = body.language || "en";
    const term = body.term.trim();

    return this.prisma.userVocabulary.upsert({
      where: {
        userId_language_term: {
          userId,
          language,
          term,
        },
      },
      update: {},
      create: {
        userId,
        language,
        term,
        source: "video",
        nativeTranslation: body.translation || body.meaning || null,
        learnerDescription: body.meaning || null,
      },
    });
  }

  async getProfile(userId: number) {
    return this.authProfileService.get_profile(userId);
  }

  private utcWeekRange(): { weekStart: Date; weekEndExclusive: Date } {
    const now = new Date();
    const day = (d: Date) => d.getUTCDay();
    const x = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const dow = day(x);
    const offset = dow === 0 ? -6 : 1 - dow;
    x.setUTCDate(x.getUTCDate() + offset);
    x.setUTCHours(0, 0, 0, 0);
    const weekEndExclusive = new Date(x);
    weekEndExclusive.setUTCDate(weekEndExclusive.getUTCDate() + 7);
    return { weekStart: x, weekEndExclusive };
  }

  async getLearningStats(userId: number) {
    return this.authLearningStatsService.get_learning_stats(userId);
  }

  async getKnowledgeTagProgress(userId: number) {
    return this.authKnowledgeTagsService.get_knowledge_tag_progress(userId);
  }

  async refreshKnowledgeTagProgress(userId: number) {
    return this.authKnowledgeTagsService.refresh_knowledge_tag_progress(userId);
  }

  async getProgressDetails(userId: number) {
    return this.authProgressDetailsService.get_progress_details(userId);
  }
}
