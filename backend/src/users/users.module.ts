import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AlcorythmModule } from "../alcorythm/alcorythm.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { MailModule } from "src/common/mail/mail.module";
import { ConstellationModule } from "src/constelattions/constellation.module";

@Module({
  imports: [AlcorythmModule, AuthModule, MailModule, ConstellationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
