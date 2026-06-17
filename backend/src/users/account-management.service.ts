import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomInt } from "node:crypto";
import { MailService } from "src/common/mail/mail.service";
import { PrismaService } from "src/prisma.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AccountManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,

    private readonly mailService: MailService,
  ) {}
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
