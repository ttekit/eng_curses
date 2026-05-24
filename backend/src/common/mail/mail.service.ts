import { MailerService } from "@nestjs-modules/mailer";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isOutboundMailDisabled } from "src/common/utils/outbound-mail-disabled.util";
import { render } from "@react-email/components";
import { ConfirmationTemplate } from "./templates/confirmation.template";
import { ResetPasswordTemplate } from "./templates/reset-password.template";

import { PasswordChangedTemplate } from "./templates/password-change-notification.template";
import * as React from "react";
import EmailChangeTemplate from "./templates/email-change";
import { PrismaService } from "src/prisma.service";
import AccountDeletedTemplate from "./templates/account-deleted";
import { promises as dns } from "dns";
import { Resolver } from "dns/promises";
import { TwoFactorAuthTemplate } from "./templates/two-factor-auth.template";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  public async sendConfirmationEmail(email: string, code: string) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled (DISABLE_EMAIL); skipping confirmation to ${email}`,
      );
      return;
    }
    const isDomainValid = await this.validateEmailDomain(email);

    if (!isDomainValid) {
      this.logger.warn(
        `Registration blocked: Domain for email ${email} does not exist.`,
      );
      throw new BadRequestException(
        "Вказана поштова адреса не існує або не може приймати листи. Перевірте правильність введення.",
      );
    }

    const html = await render(
      React.createElement(ConfirmationTemplate, { code }),
    );

    return this.sendMail(email, "Код підтвердження реєстрації — Explys", html);
  }

  public async sendPasswordResetEmail(email: string, token: string) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled (DISABLE_EMAIL); skipping password reset to ${email}`,
      );
      return;
    }
    const domain = this.configService.getOrThrow<string>("FRONTEND_URL");
    const html = await render(ResetPasswordTemplate({ domain, token }));

    return this.sendMail(email, "Reset password", html);
  }

  public async sendTwoFactorTokenEmail(email: string, token: string) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled (DISABLE_EMAIL); skipping 2FA mail to ${email}`,
      );
      return;
    }
    const html = await render(
      React.createElement(TwoFactorAuthTemplate, { token }),
    );

    return this.sendMail(email, "Verify your identity", html);
  }

  async sendEmailChangeCode(email: string, code: string) {
    try {
      const htmlContent = await render(EmailChangeTemplate({ code }));

      await this.mailerService.sendMail({
        from: '"Explys Support" <noreply@explys.com>',
        to: email,
        subject: "Verification Code for Email Change",
        html: htmlContent,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Не вдалося відправити лист з кодом",
      );
    }
  }

  private async sendMail(email: string, subject: string, html: string) {
    try {
      const result = await this.mailerService.sendMail({
        from: '"Explys Support" <noreply@explys.com>',
        to: email,
        subject,
        html,
      });
      this.logger.debug(`Mail sent to user: ${subject}`);
      return result;
    } catch (error) {
      this.logger.error(`Mail send failed for user`, error as Error);
      throw error;
    }
  }

  async sendPasswordChangedNotification(email: string) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled (DISABLE_EMAIL); skipping password-changed notice to ${email}`,
      );
      return;
    }
    try {
      const emailHtml = await render(
        React.createElement(PasswordChangedTemplate, { email }),
      );
      await this.mailerService.sendMail({
        from: '"Explys Support" <noreply@explys.com>',
        to: email,
        subject: "Security Alert: Password Changed 🦎",
        html: emailHtml,
      });
    } catch (error) {
      this.logger.error(
        `Password-changed mail failed for ${email}`,
        error as Error,
      );
      throw error;
    }
  }

  async sendAccountDeletedEmail(
    email: string,
    name: string,
    restoreLink: string,
  ) {
    try {
      const htmlContent = await render(
        AccountDeletedTemplate({ name, restoreLink }),
      );

      const info = await this.mailerService.sendMail({
        from: '"Explys Support" <noreply@explys.com>',
        to: email,
        subject: "Account Deletion Notice (Action Required)",
        html: htmlContent,
      });
    } catch (error) {
      console.error("❌ ОШИБКА MailerService:", error);
    }
  }

  private readonly disposableDomains = new Set([
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
    "tempmail.com",
  ]);

  public async validateEmailDomain(email: string): Promise<boolean> {
    const trustedDomains = [
      "gmail.com",
      "outlook.com",
      "icloud.com",
      "hotmail.com",
      "ukr.net",
      "yahoo.com",
      "protonmail.com",
      "meta.ua",
      "me.com",
    ];

    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;

    if (!trustedDomains.includes(domain)) {
      this.logger.warn(`Domain ${domain} is not in whitelist.`);
      return false;
    }

    if (this.disposableDomains.has(domain)) return false;

    try {
      const resolver = new Resolver();
      resolver.setServers(["1.1.1.1", "8.8.8.8"]);

      const mxRecords = await resolver.resolveMx(domain);

      if (!mxRecords || mxRecords.length === 0) return false;

      return true;
    } catch (error) {
      const err = error as any;
      this.logger.warn(
        `Validation failed for ${email}: ${err?.message || "Unknown error"}`,
      );
      return false;
    }
  }

  public async sendCustomEmail(email: string, subject: string, html: string) {
    return await this.sendMail(email, subject, html);
  }

  public async sendNotification(
    to: string,
    subject: string,
    template: React.ReactElement,
  ) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled; skipping notification to ${to}`,
      );
      return;
    }

    const html = await render(template);
    return this.sendMail(to, subject, html);
  }
}
