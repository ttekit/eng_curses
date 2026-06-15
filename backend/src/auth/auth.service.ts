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
import {
  AuthMethod,
  TokenType,
  User,
  UserRole,
} from "@generated/prisma/client";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ProviderService } from "./provider/provider.service";
import { EmailConfirmationService } from "./email-confirmation/email-confirmation.service";
import { TwoFactorAuthService } from "./two-factor-auth/two-factor-auth.service";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import {
  isDevModeEnabled,
  isEmailConfirmationDisabled,
} from "src/common/utils/outbound-mail-disabled.util";
import { MailService } from "src/common/mail/mail.service";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { ToggleTwoFactorDto } from "./dto/toggle-2fa.dto";
import { VerifyEmailChangeDto } from "./dto/verify-email-change.dto";
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
    emailConfirmationDisabled: boolean,
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
        isVerified: emailConfirmationDisabled,
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
    const emailConfirmationDisabled = isEmailConfirmationDisabled(
      this.configService,
    );

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

    if (!emailConfirmationDisabled) {
      otpCode = randomInt(100000, 1000000).toString();
      otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    }

    const mainUser = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: roleLabel as any,
        method: "CREDENTIALS",
        isVerified: emailConfirmationDisabled,
        verificationCode: otpCode,
        verificationCodeExpires: otpExpires,
        subscriptionPlan: "smart",
        subscriptionStatus: "active",
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
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
        const student = await this.generateStudentAccount(
          pupil,
          mainUser.id,
          emailConfirmationDisabled,
        );
        generatedStudents.push(student);
      }
    }

    if (!emailConfirmationDisabled) {
      await this.emailConfirmationService.sendVerificationToken(mainUser);
    }

    const payload = { sub: mainUser.id, email: mainUser.email };

    return {
      access_token: emailConfirmationDisabled
        ? await this.jwtService.signAsync(payload)
        : null,
      isVerified: emailConfirmationDisabled,
      user: {
        id: mainUser.id,
        email: mainUser.email,
        name: mainUser.name,
      },
      generatedStudents:
        generatedStudents.length > 0 ? generatedStudents : undefined,
      message: emailConfirmationDisabled
        ? "You have successfully registered."
        : "Please verify your email. A 6-digit confirmation code has been sent to your email address.",
    };
  }

  async verifyEmailCode(email: string, code: string) {
    const prisma = this.prisma as any;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException("User with this email does not exist.");
    }

    if (user.isVerified) {
      throw new BadRequestException("This account is already verified.");
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException("Invalid confirmation code.");
    }

    if (
      !user.verificationCodeExpires ||
      new Date() > new Date(user.verificationCodeExpires)
    ) {
      throw new BadRequestException(
        "Verification code has expired. Please request a new one.",
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    const payload = { sub: updatedUser.id, email: updatedUser.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      message: "Email successfully verified. Welcome!",
    };
  }

  async deleteAccount(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("User not found");

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException("Invalid verification code.");
    }
    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException("Verification code has expired.");
    }

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletionScheduledAt: deletionDate,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    await this.prisma.token.deleteMany({ where: { email: user.email } });

    const restoreToken = uuidv4();
    await this.prisma.token.create({
      data: {
        email: user.email,
        token: restoreToken,
        type: "ACCOUNT_RESTORE",
        expiresIn: deletionDate,
      },
    });

    const restoreLink = `${this.configService.getOrThrow<string>("FRONTEND_URL")}/restore-account?token=${restoreToken}`;
    await this.mailService.sendAccountDeletedEmail(
      user.email,
      user.name,
      restoreLink,
    );

    return {
      success: true,
      message: "This account is scheduled to be deleted in 30 days.",
    };
  }

  async restoreAccount(token: string) {
    const tokenRecord = await this.prisma.token.findUnique({
      where: { token },
    });

    if (
      !tokenRecord ||
      tokenRecord.type !== "ACCOUNT_RESTORE" ||
      tokenRecord.expiresIn < new Date()
    ) {
      throw new BadRequestException(
        "The recovery link is invalid or has expired.",
      );
    }

    await this.prisma.user.update({
      where: { email: tokenRecord.email },
      data: { deletionScheduledAt: null },
    });

    await this.prisma.token.delete({ where: { id: tokenRecord.id } });

    return {
      success: true,
      message: "Your account has been successfully restored!",
    };
  }

  public async confirmEmail(token: string) {
    const existingToken = await this.prisma.token.findUnique({
      where: {
        token: token,
      },
    });

    if (!existingToken) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: existingToken.email,
      },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    await this.prisma.token.delete({
      where: { id: existingToken.id },
    });

    return { message: "Your email address has been successfully verified" };
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
        const student = await this.generateStudentAccount(pupil, userId, true);
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
        ...(data.role ? { role: data.role.toUpperCase() as any } : {}),
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

  public async resendConfirmationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException("No user with that email address was found");
    }

    if (user.isVerified) {
      throw new BadRequestException(
        "This email address has already been verified. You can now log in.",
      );
    }

    if (isEmailConfirmationDisabled(this.configService)) {
      throw new BadRequestException(
        "Email verification is disabled on this server. Please log in—your account will be activated automatically.",
      );
    }

    await this.emailConfirmationService.sendVerificationToken(user);

    return { message: "A new confirmation email has been sent successfully" };
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

    if (!user.isVerified) {
      if (isEmailConfirmationDisabled(this.configService)) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        });
      } else {
        await this.emailConfirmationService.sendVerificationToken(user, true);

        throw new ForbiddenException({
          message: "Email not verified. Please check your mail.",
          error: "EMAIL_NOT_VERIFIED",
        });
      }
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
        hasCompletedPlacement: user.hasCompletedPlacement,

        subscriptionPlan: user.subscriptionPlan ?? "",
        subscriptionStatus: user.subscriptionStatus ?? "",
        stripeSubscriptionId: user.stripeSubscriptionId ?? "",
      },
    };
  }

  async toggleTwoFactor(userId: number, dto: ToggleTwoFactorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect password");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnable: dto.enable },
    });

    return {
      success: true,
      message: dto.enable
        ? "Two-factor authentication is enabled"
        : "Two-factor authentication is disabled",
    };
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect current password");
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    this.mailService
      .sendPasswordChangedNotification(user.email)
      .catch((err) => {
        console.error(
          `Failed to send password changed notification to ${user.email}`,
          err,
        );
      });

    return { message: "Password successfully updated" };
  }

  async updateEmail(userId: number, dto: UpdateEmailDto) {
    const isDomainValid = await this.mailService.validateEmailDomain(
      dto.newEmail,
    );
    if (!isDomainValid) {
      throw new BadRequestException(
        "The provided email domain does not exist or cannot receive mail.",
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.newEmail },
    });

    if (existingUser) {
      throw new BadRequestException(
        "This email address is already in use by another user",
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.newEmail,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return {
      success: true,
      message: "Your email address has been successfully updated!",
    };
  }

  async sendEmailChangeCode(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const otpCode = randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: otpCode,
        verificationCodeExpires: otpExpires,
      },
    });

    await this.mailService.sendEmailChangeCode(updatedUser.email, otpCode);

    return {
      success: true,
      message: "The code to change your email address has been sent",
    };
  }

  async checkEmailChangeCode(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { verificationCode: true, verificationCodeExpires: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException("Incorrect verification code");
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException(
        "The code has expired. Please send a new one.",
      );
    }

    return {
      success: true,
      message: "The code has been successfully verified",
    };
  }

  async verifyAndChangeEmail(userId: number, dto: VerifyEmailChangeDto) {
    const newEmail = (dto as any).newEmail || (dto as any).email;
    const code = dto.code;

    const isDomainValid = await this.mailService.validateEmailDomain(newEmail);
    if (!isDomainValid) {
      throw new BadRequestException(
        "The provided email domain does not exist or cannot receive mail.",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException("Incorrect verification code");
    }
    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException(
        "The code has expired. Please send a new one.",
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException("This email address is already in use");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return {
      success: true,
      message: "Your email address has been successfully updated",
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
      if (!existingUser.isVerified) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { isVerified: true },
        });
      }

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

  public async saveSession(req: Request, user: Partial<User>) {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        "User not found or session data is missing",
      );
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    req.session.userId = user.id.toString();

    return new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              "Failed to save session. Please check if session parameters are configured correctly.",
            ),
          );
        }
        resolve({
          user,
          token,
        });
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

  async sendDangerZoneCode(userId: number, action: "delete" | "reset") {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const otpCode = randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationCode: otpCode, verificationCodeExpires: otpExpires },
    });

    await this.mailService.sendDangerZoneCode(user.email, otpCode, action);

    return { success: true, message: "Verification code sent to your email." };
  }
}
