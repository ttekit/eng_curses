import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: config.get<string>("SMTP_HOST")?.trim()
          ? {
              host: config.get<string>("SMTP_HOST"),
              port: Number(config.get<string>("SMTP_PORT") ?? 587),
              secure: false,
              auth: {
                user: config.get<string>("SMTP_USER"),
                pass: config.get<string>("SMTP_PASS"),
              },
            }
          : { jsonTransport: true },
        defaults: {
          from: '"Explys" <no-reply@localhost>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
