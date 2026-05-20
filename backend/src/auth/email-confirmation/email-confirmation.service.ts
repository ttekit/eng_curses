import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { MailService } from "src/common/mail/mail.service";
import { TokenType } from "@generated/prisma/client";
import { randomBytes } from "crypto";
import type { Request } from "express";
import type { ConfirmationDto } from "./dto/confirmation.dto";
import type { User } from "@generated/prisma/client";

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async sendVerificationToken(user: { email: string; verificationCode?: string | null }): Promise<void> {
    const email = user.email.toLowerCase();
    
    const code = user.verificationCode;

    if (!code) {
      throw new BadRequestException("Код верифікації не знайдено для цього користувача.");
    }

    await this.mail.sendConfirmationEmail(email, code);
  }

  async newVerification(
    _req: Request,
    dto: ConfirmationDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.confirmWithToken(dto.token);
    return { success: true, message: "Email successfully confirmed" };
  }

  private async confirmWithToken(rawToken: string): Promise<void> {
    const token = String(rawToken ?? "").trim();
    if (!token) {
      throw new BadRequestException("Missing token");
    }
    const existing = await this.prisma.token.findUnique({
      where: { token },
    });
    if (!existing || existing.type !== TokenType.VERIFICATION) {
      throw new BadRequestException("Invalid or expired confirmation token");
    }
    if (existing.expiresIn.getTime() < Date.now()) {
      throw new BadRequestException("Confirmation token has expired");
    }
    const user = await this.prisma.user.findUnique({
      where: { email: existing.email },
    });
    if (!user) {
      throw new NotFoundException("User not found for this token");
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
    await this.prisma.token.delete({ where: { id: existing.id } });
  }
}
