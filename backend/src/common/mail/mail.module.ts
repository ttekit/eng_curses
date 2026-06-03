import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { isOutboundMailDisabled } from "src/common/utils/outbound-mail-disabled.util";
import { MailService } from "./mail.service";
import {
  buildNodemailerTransportOptions,
  resolveSmtpSettings,
} from "./smtp-settings.util";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const defaultFrom =
          '"Explys Support" <noreply@explys.com>';
        if (isOutboundMailDisabled(config)) {
          return {
            transport: { jsonTransport: true },
            defaults: { from: defaultFrom },
          };
        }
        const smtp = resolveSmtpSettings(config);
        if (!smtp) {
          return {
            transport: { jsonTransport: true },
            defaults: { from: defaultFrom },
          };
        }
        return {
          transport: buildNodemailerTransportOptions(smtp),
          defaults: { from: smtp.from },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
