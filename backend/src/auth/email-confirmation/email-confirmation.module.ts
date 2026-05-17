import { Module } from "@nestjs/common";
import { EmailConfirmationController } from "./email-confirmation.controller";
import { EmailConfirmationService } from "./email-confirmation.service";
import { MailModule } from "src/common/mail/mail.module";

@Module({
  imports: [MailModule],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
