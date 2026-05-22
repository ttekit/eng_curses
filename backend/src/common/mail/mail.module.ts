import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>("SMTP_HOST");
        const port = Number(config.get<string>("SMTP_PORT") ?? 587);

        return {
          transport: host?.trim()
            ? {
                host: host,
                port: port,
                secure: false,
                auth: {
                  user: config.get<string>("SMTP_USER"),
                  pass: config.get<string>("SMTP_PASSWORD"),
                },
                tls: {
                  rejectUnauthorized: false,
                  ciphers: "SSLv3",
                },
              }
            : { jsonTransport: true },
          defaults: {
            from:
              config.get<string>("SMTP_FROM") ??
              '"Explys Support" <noreply@explys.com>',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
