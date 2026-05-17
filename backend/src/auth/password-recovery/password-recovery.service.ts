import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { MailService } from "src/common/mail/mail.service";
import { TokenType } from "@generated/prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import type { ResetPasswordDto } from "./dto/reset-password.dto";
import type { NewPasswordDto } from "./dto/new-password.dto";

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        message:
          "If an account exists for that email, reset instructions have been sent.",
      };
    }
    const token = randomBytes(32).toString("hex");
    const expiresIn = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.token.upsert({
      where: { email },
      create: {
        email,
        token,
        type: TokenType.PASSWORD_RESET,
        expiresIn,
      },
      update: {
        token,
        type: TokenType.PASSWORD_RESET,
        expiresIn,
      },
    });
    await this.mail.sendPasswordResetEmail(email, token);
    return {
      message:
        "If an account exists for that email, reset instructions have been sent.",
    };
  }

  async newPassword(
    dto: NewPasswordDto,
    tokenValue: string,
  ): Promise<{ message: string }> {
    const token = String(tokenValue ?? "").trim();
    if (!token) {
      throw new BadRequestException("Missing reset token");
    }
    const row = await this.prisma.token.findUnique({
      where: { token },
    });
    if (!row || row.type !== TokenType.PASSWORD_RESET) {
      throw new BadRequestException("Invalid or expired reset token");
    }
    if (row.expiresIn.getTime() < Date.now()) {
      throw new BadRequestException("Reset token has expired");
    }
    const user = await this.prisma.user.findUnique({
      where: { email: row.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    await this.prisma.token.delete({ where: { id: row.id } });
    return { message: "Password updated successfully" };
  }
}
