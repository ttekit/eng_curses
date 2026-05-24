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
import { AuthMethod, TokenType, User } from "@generated/prisma/client";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ProviderService } from "./provider/provider.service";
import { EmailConfirmationService } from "./email-confirmation/email-confirmation.service";
import { TwoFactorAuthService } from "./two-factor-auth/two-factor-auth.service";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { isOutboundMailDisabled } from "src/common/utils/outbound-mail-disabled.util";
import { MailService } from "src/common/mail/mail.service";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { ToggleTwoFactorDto } from "./dto/toggle-2fa.dto";
import { VerifyEmailChangeDto } from "./dto/verify-email-change.dto";
import { v4 as uuidv4 } from "uuid";

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
  ) { }

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
      : "ADULT";

    let otpCode: string | null = null;
    let otpExpires: Date | null = null;

    if (!outboundMailDisabled) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    }

    const mainUser = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: roleLabel as any,
        method: "CREDENTIALS",
        isVerified: outboundMailDisabled,
        verificationCode: otpCode,
        verificationCodeExpires: otpExpires,
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
        const randomId = Math.floor(1000 + Math.random() * 9000);

        let firstName = "student";
        let lastName = randomId.toString();

        if (typeof pupil === "object" && pupil !== null) {
          firstName = (pupil as any).name || "student";
          lastName = (pupil as any).surname || randomId.toString();
        } else if (typeof pupil === "string") {
          const parts = pupil.split(" ");
          firstName = parts[0] || "student";
          lastName = parts[1] || randomId.toString();
        }

        const studentEmail =
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${randomId}@alcorythm.com`.replace(
            /\s+/g,
            "",
          );
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedStudentPassword = await bcrypt.hash(tempPassword, 10);

        await prisma.user.create({
          data: {
            email: studentEmail.toLowerCase(),
            password: hashedStudentPassword,
            name: `${firstName} ${lastName}`.trim(),
            role: "STUDENT",
            method: "CREDENTIALS",
            teacherId: mainUser.id,
            isVerified: outboundMailDisabled,
          },
        });

        generatedStudents.push({
          name: `${firstName} ${lastName}`.trim(),
          email: studentEmail,
          password: tempPassword,
        });
      }
    }

    if (!outboundMailDisabled) {
      await this.emailConfirmationService.sendVerificationToken(mainUser);
    }

    const payload = { sub: mainUser.id, email: mainUser.email };

    return {
      access_token: outboundMailDisabled
        ? await this.jwtService.signAsync(payload)
        : null,
      isVerified: outboundMailDisabled,
      user: {
        id: mainUser.id,
        email: mainUser.email,
        name: mainUser.name,
      },
      generatedStudents:
        generatedStudents.length > 0 ? generatedStudents : undefined,
      message: outboundMailDisabled
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

  async deleteAccount(userId: number, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new UnauthorizedException("Користувача не знайдено");
    if (!user.password)
      throw new BadRequestException("Акаунт зареєстровано через Google.");

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new BadRequestException("Невірний пароль.");

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

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

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletionScheduledAt: deletionDate },
    });

    const restoreLink = `http://localhost:5173/restore-account?token=${restoreToken}`;
    await this.mailService.sendAccountDeletedEmail(
      user.email,
      user.name,
      restoreLink,
    );

    return {
      success: true,
      message: "Акаунт заплановано на видалення через 30 днів.",
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
        "Посилання для відновлення недійсне або прострочене.",
      );
    }

    await this.prisma.user.update({
      where: { email: tokenRecord.email },
      data: { deletionScheduledAt: null },
    });

    await this.prisma.token.delete({ where: { id: tokenRecord.id } });

    return { success: true, message: "Ваш акаунт успішно відновлено!" };
  }

  public async confirmEmail(token: string) {
    const existingToken = await this.prisma.token.findUnique({
      where: {
        token: token,
      },
    });

    if (!existingToken) {
      throw new BadRequestException(
        "Невірний або прострочений токен підтвердження",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: existingToken.email,
      },
    });

    if (!user) {
      throw new BadRequestException("Користувача не знайдено");
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

    return { message: "Email успішно підтверджено" };
  }

  async updateUserPreferences(userId: number, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        additionalUserData: {
          update: {
            hobbies: data.hobbies,
            knownLanguages: data.knownLanguages,
          },
        },
      },
    });
  }

  public async resendConfirmationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException("Користувача з таким email не знайдено");
    }

    if (user.isVerified) {
      throw new BadRequestException(
        "Цей email вже підтверджено. Ви можете увійти в систему.",
      );
    }

    if (isOutboundMailDisabled(this.configService)) {
      throw new BadRequestException(
        "Підтвердження email поштою вимкнено на цьому сервері. Увійдіть у систему — обліковий запис буде активовано автоматично.",
      );
    }

    await this.emailConfirmationService.sendVerificationToken(user);

    return { message: "Новий лист підтвердження надіслано успішно" };
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
        throw new UnauthorizedException("Аккаунт було видалено.");
      }
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isVerified) {
      if (isOutboundMailDisabled(this.configService)) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        });
      } else {
        await this.emailConfirmationService.sendVerificationToken(user);
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
        role: user.role,
        hasCompletedPlacement: user.hasCompletedPlacement,

        subscriptionPlan: (user as any).subscriptionPlan ?? "",
        subscriptionStatus: (user as any).subscriptionStatus ?? "",
        stripeSubscriptionId: (user as any).stripeSubscriptionId ?? "",
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
      throw new UnauthorizedException("Невірний пароль");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnable: dto.enable },
    });

    return {
      success: true,
      message: dto.enable
        ? "Двофакторна автентифікація увімкнена"
        : "Двофакторна автентифікація вимкнена",
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
      throw new UnauthorizedException("Неверный текущий пароль");
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
    const isDomainValid = await this.mailService.validateEmailDomain(dto.newEmail);
    if (!isDomainValid) {
      throw new BadRequestException("The provided email domain does not exist or cannot receive mail.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.newEmail },
    });

    if (existingUser) {
      throw new BadRequestException(
        "Ця пошта вже використовується іншим користувачем",
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
      message: "Пошту успешно змінено!",
    };
  }

  async sendEmailChangeCode(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Користувача не знайдено");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: otpCode,
        verificationCodeExpires: otpExpires,
      },
    });

    await this.mailService.sendEmailChangeCode(updatedUser.email, otpCode);

    return { success: true, message: "Код для зміни пошти надіслано" };
  }

  async checkEmailChangeCode(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { verificationCode: true, verificationCodeExpires: true },
    });

    if (!user) {
      throw new NotFoundException("Користувача не знайдено");
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException("Невірний код підтвердження");
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException("Термін дії коду минув. Відправте новий.");
    }

    return { success: true, message: "Код успішно перевірено" };
  }

  async verifyAndChangeEmail(userId: number, dto: VerifyEmailChangeDto) {
    const newEmail = (dto as any).newEmail || (dto as any).email;
    const code = dto.code;

    const isDomainValid = await this.mailService.validateEmailDomain(newEmail);
    if (!isDomainValid) {
      throw new BadRequestException("The provided email domain does not exist or cannot receive mail.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Користувача не знайдено");
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new BadRequestException("Невірний код підтвердження");
    }
    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException("Термін дії коду минув. Відправте новий.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException("Ця електронна адреса вже використовується");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return { success: true, message: "Пошту успішно змінено" };
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ) {
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
      return this.saveSession(req, full);
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

    return this.saveSession(req, created);
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
    return new Promise((resolve, reject) => {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          "User not found or session data is missing",
        );
      }
      req.session.userId = user.id.toString();

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
        });
      });
    });
  }

  async saveWordToVocabulary(userId: number, body: any) {
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        additionalUserData: {
          include: {
            favoriteGenres: true,
            hatedGenres: true,
          },
        },
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isSuspended) {
      throw new ForbiddenException("Account suspended");
    }
    const extra = (user as any).additionalUserData;

    return {
      id: (user as any).id,
      name: (user as any).name,
      email: (user as any).email,
      isTwoFactorEnable: (user as any).isTwoFactorEnable,
      isVerified: (user as any).isVerified,
      role: (user as any).role,
      xp: (user as any).xp,
      hasCompletedPlacement: (user as any).hasCompletedPlacement,
      currentStreak: (user as any).currentStreak ?? 0,
      englishLevel: extra?.englishLevel ?? "",
      education: extra?.education ?? "",
      workField: extra?.workField ?? "",
      nativeLanguage: extra?.nativeLanguage ?? "",
      hobbies: extra?.hobbies ?? [],
      learningGoal: extra?.learningGoal ?? "",
      timeToAchieve: extra?.timeToAchieve ?? "",
      favoriteGenres: extra?.favoriteGenres?.map((g: any) => g.id) ?? [],
      hatedGenres: extra?.hatedGenres?.map((g: any) => g.id) ?? [],
      playbackSpeed: (user as any).settings?.playbackSpeed ?? null,
      videoQuality: (user as any).settings?.currentResolution ?? "",
      subscriptionPlan: (user as any).subscriptionPlan ?? "",
      subscriptionStatus: (user as any).subscriptionStatus ?? "",
      stripeSubscriptionId: (user as any).stripeSubscriptionId ?? "",
    };
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuspended: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isSuspended) {
      throw new ForbiddenException("Account suspended");
    }

    const [watchSum, distinctVideos, quizAgg, weekSessions] = await Promise.all(
      [
        this.prisma.watchSession.aggregate({
          where: { userId },
          _sum: { secondsWatched: true },
        }),
        this.prisma.watchSession.findMany({
          where: { userId, completed: true },
          select: { contentVideoId: true },
          distinct: ["contentVideoId"],
        }),
        this.prisma.comprehensionTestAttempt.aggregate({
          where: { userId },
          _avg: { scorePct: true },
          _count: { _all: true },
        }),
        (() => {
          const { weekStart, weekEndExclusive } = this.utcWeekRange();
          return this.prisma.watchSession.findMany({
            where: {
              userId,
              endedAt: { gte: weekStart, lt: weekEndExclusive },
            },
            select: { endedAt: true, secondsWatched: true },
          });
        })(),
      ],
    );

    const totalSeconds = Number(watchSum?._sum?.secondsWatched ?? 0);

    const totalWatchTimeMin = Math.floor(totalSeconds / 60);

    const videosCompleted = Array.isArray(distinctVideos)
      ? distinctVideos.length
      : 0;
    const testsCompleted = quizAgg?._count?._all ?? 0;
    const rawAvg = quizAgg?._avg?.scorePct;
    const averageScore =
      typeof rawAvg === "number" && Number.isFinite(rawAvg)
        ? Math.round(rawAvg)
        : null;

    const minutesMonSun = [0, 0, 0, 0, 0, 0, 0];
    const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (const s of weekSessions) {
      if (!s.endedAt) continue;
      const d = s.endedAt as Date;
      const utcDow = d.getUTCDay();
      const idx = utcDow === 0 ? 6 : utcDow - 1;
      minutesMonSun[idx] += Number(s.secondsWatched ?? 0) / 60;
    }

    const weeklyActivity = DAY_LABELS.map((day, i) => ({
      day,
      minutes: Math.ceil(minutesMonSun[i]),
    }));

    return {
      totalWatchTimeMin,
      videosCompleted,
      testsCompleted,
      averageScore,
      weeklyActivity,
    };
  }

  async getKnowledgeTagProgress(userId: number): Promise<{
    tags: Array<{
      name: string;
      score: number;
      listening: number;
      vocabulary: number;
      grammar: number;
      topicCount: number;
    }>;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuspended: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isSuspended) {
      throw new ForbiddenException("Account suspended");
    }

    const rows = await this.prisma.userLanguageData.findMany({
      where: { userId },
      include: {
        topic: { include: { tags: { select: { name: true } } } },
      },
    });

    const accum = new Map<
      string,
      { l: number; v: number; g: number; agg: number; n: number }
    >();

    for (const row of rows) {
      for (const tag of row.topic.tags) {
        const name = tag.name.trim();
        if (!name) {
          continue;
        }
        const cur = accum.get(name) ?? { l: 0, v: 0, g: 0, agg: 0, n: 0 };
        cur.l += row.listeningScore;
        cur.v += row.vocabularyScore;
        cur.g += row.grammarScore;
        cur.agg += row.score;
        cur.n += 1;
        accum.set(name, cur);
      }
    }

    const tags = [...accum.entries()]
      .map(([name, cur]) => {
        const n = cur.n;
        return {
          name,
          listening: Math.round((cur.l / n) * 1000) / 1000,
          vocabulary: Math.round((cur.v / n) * 1000) / 1000,
          grammar: Math.round((cur.g / n) * 1000) / 1000,
          score: Math.round((cur.agg / n) * 1000) / 1000,
          topicCount: cur.n,
        };
      })
      .sort((a, b) => b.score - a.score);

    return { tags };
  }

  async getProgressDetails(userId: number) {
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException("Invalid user ID");
    }

    let totalWords = 0;
    let learnedWords = 0;
    let masteredWords = 0;

    try {
      totalWords = await this.prisma.userVocabulary.count({
        where: { userId },
      });

      learnedWords = await this.prisma.userVocabulary.count({
        where: {
          userId,
          mastery: { gt: 0 },
        },
      });

      masteredWords = await this.prisma.userVocabulary.count({
        where: {
          userId,
          mastery: { gte: 0.8 },
        },
      });
    } catch (e) {
      console.error(e);
    }

    const vocabularyProgress = {
      total: totalWords,
      learned: learnedWords,
      mastered: masteredWords,
      reviewing: Math.max(0, totalWords - masteredWords),
    };

    let recentSessions: any[] = [];
    try {
      recentSessions = await this.prisma.watchSession.findMany({
        where: { userId },
        orderBy: { endedAt: "desc" },
        take: 4,
        include: { contentVideo: true },
      });
    } catch (e) {
      console.error(e);
    }

    const recentVideos = await Promise.all(
      recentSessions.map(async (session: any) => {
        let test: any = null;
        try {
          test = await this.prisma.comprehensionTestAttempt.findFirst({
            where: { userId, contentVideoId: session.contentVideoId },
            orderBy: { createdAt: "desc" },
          });
        } catch (e) {
          console.error(e);
        }

        return {
          id: String(session.id),
          title: session.contentVideo?.videoName || "Video Lesson",
          category: "General",
          completed: !!session.completed,
          score: test ? Math.round(test.scorePct) : 0,
          progress: session.completed ? 100 : 50,
        };
      }),
    );

    let completedVideosCount = 0;
    try {
      completedVideosCount = await this.prisma.watchSession.count({
        where: { userId, completed: true },
      });
    } catch (e) {
      console.error(e);
    }

    const businessCount = await this.prisma.watchSession.count({
      where: {
        userId,
        completed: true,
        contentVideo: { content: { category: { name: "Business English" } } },
      },
    });

    const travelCount = await this.prisma.watchSession.count({
      where: {
        userId,
        completed: true,
        contentVideo: {
          content: { category: { name: "Travel & Conversation" } },
        },
      },
    });

    const learningPaths = [
      {
        id: "business",
        title: "Business English",
        description: "Professional communication for the workplace",
        progress: Math.min(100, Math.round((businessCount / 12) * 100)),
        totalVideos: 12,
        completedVideos: businessCount,
        level: "B2",
        accentClass: "bg-primary",
      },
      {
        id: "travel",
        title: "Travel & Conversation",
        description: "Essential phrases for traveling abroad",
        progress: Math.min(100, Math.round((travelCount / 10) * 100)),
        totalVideos: 10,
        completedVideos: travelCount,
        level: "B1",
        accentClass: "bg-accent",
      },
    ];

    return {
      vocabularyProgress,
      recentVideos,
      learningPaths,
    };
  }
}