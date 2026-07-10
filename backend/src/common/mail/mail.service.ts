import { MailerService } from "@nestjs-modules/mailer";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isOutboundMailDisabled } from "src/common/utils/outbound-mail-disabled.util";
import { resolveSmtpSettings } from "./smtp-settings.util";
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
import DeleteAccountCodeTemplate from "./templates/delete-account-code.template";
import ResetProgressCodeTemplate from "./templates/reset-progress-code.template";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        "Outbound mail disabled (DISABLE_EMAIL=true). Set DISABLE_EMAIL=false to send mail.",
      );
      return;
    }
    const smtp = resolveSmtpSettings(this.configService);
    if (!smtp) {
      this.logger.warn(
        "SMTP credentials are incomplete (set SMTP_HOST, SMTP_USER, SMTP_PASSWORD)",
      );
      return;
    }
    this.logger.log(
      `SMTP enabled host=${smtp.host} port=${smtp.port} secure=${smtp.secure}`,
    );
  }

  public async sendConfirmationEmail(
    email: string,
    code: string,
    isLogin: boolean = false,
  ) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled (DISABLE_EMAIL); skipping confirmation to ${email}`,
      );
      return;
    }
    const isDomainValid = await this.validateEmailDomain(email);

    const html = await render(
      React.createElement(ConfirmationTemplate, { code, isLogin }),
    );

    const subject = isLogin
      ? "Verify your email to log in — Explys"
      : "Registration confirmation code — Explys";

    return this.sendMail(email, subject, html);
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
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled; skipping email-change code to ${email}`,
      );
      return;
    }
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
        "The email containing the code could not be sent",
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
    } catch (error) {}
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

    if (this.disposableDomains.has(domain)) return false;

    try {
      const resolver = new Resolver();
      resolver.setServers(["1.1.1.1", "8.8.8.8"]);

      const mxRecords = await resolver.resolveMx(domain);

      if (!mxRecords || mxRecords.length === 0) return false;

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Validation failed for ${email}: ${message}`);
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

  async sendDangerZoneCode(
    email: string,
    code: string,
    action: "delete" | "reset",
  ) {
    if (isOutboundMailDisabled(this.configService)) {
      this.logger.warn(
        `Outbound mail disabled; skipping danger zone code to ${email}`,
      );
      return;
    }

    try {
      const Template =
        action === "delete"
          ? DeleteAccountCodeTemplate
          : ResetProgressCodeTemplate;
      const subject =
        action === "delete"
          ? "Action Required: Confirm Account Deletion"
          : "Action Required: Confirm Progress Reset";

      const htmlContent = await render(React.createElement(Template, { code }));

      await this.mailerService.sendMail({
        from: '"Explys Support" <noreply@explys.com>',
        to: email,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      this.logger.error(`Danger zone mail failed for ${email}`, error as Error);
      throw new InternalServerErrorException(
        "The email containing the code could not be sent",
      );
    }
  }
}
