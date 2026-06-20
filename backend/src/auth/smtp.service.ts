import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { VerifyEmailChangeDto } from "./dto/verify-email-change.dto";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "src/common/mail/mail.service";
import { EmailConfirmationService } from "./email-confirmation/email-confirmation.service";
import { ConfigService } from "@nestjs/config";
import { randomInt } from "node:crypto";
import { ToggleTwoFactorDto } from "./dto/toggle-2fa.dto";
import * as bcrypt from "bcrypt";
import {
  isEmailConfirmationDisabled,
  isOutboundMailDisabled,
} from "src/common/utils/outbound-mail-disabled.util";

@Injectable()
export class SmtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly mailService: MailService,
  ) {}
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

  async toggleTwoFactor(userId: number, dto: ToggleTwoFactorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password ?? "");
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

    if (isOutboundMailDisabled(this.configService)) {
      throw new BadRequestException(
        "Outbound email is disabled on this server. Contact support if you need to verify your address.",
      );
    }

    await this.emailConfirmationService.sendVerificationToken(user);

    return { message: "A new confirmation email has been sent successfully" };
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
}
