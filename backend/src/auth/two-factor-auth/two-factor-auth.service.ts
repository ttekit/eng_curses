import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { MailService } from "src/common/mail/mail.service";
import { TokenType } from "@generated/prisma/client";
import { randomInt } from "crypto";

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async sendTwoFactorToken(email: string): Promise<void> {
    const normalized = email.toLowerCase();
    const code = String(randomInt(100_000, 1_000_000));
    const expiresIn = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.token.upsert({
      where: { email: normalized },
      create: {
        email: normalized,
        token: code,
        type: TokenType.TWO_FACTOR,
        expiresIn,
      },
      update: {
        token: code,
        type: TokenType.TWO_FACTOR,
        expiresIn,
      },
    });
    await this.mail.sendTwoFactorTokenEmail(normalized, code);
  }

  async validateTwoFactorToken(email: string, code: string): Promise<void> {
    const normalized = email.toLowerCase();
    const row = await this.prisma.token.findUnique({
      where: { email: normalized },
    });
    if (!row || row.type !== TokenType.TWO_FACTOR) {
      throw new UnauthorizedException("Invalid two-factor code");
    }
    if (row.expiresIn.getTime() < Date.now()) {
      throw new UnauthorizedException("Two-factor code has expired");
    }
    if (row.token.trim() !== String(code).trim()) {
      throw new UnauthorizedException("Invalid two-factor code");
    }
    await this.prisma.token.delete({ where: { id: row.id } });
  }
}
