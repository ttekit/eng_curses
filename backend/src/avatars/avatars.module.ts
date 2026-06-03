// avatars.module.ts
import { Module } from "@nestjs/common";
import { AvatarsController } from "./avatars.controller";
import { AvatarsService } from "./avatars.service";
import { MulterModule } from "@nestjs/platform-express";
import * as multer from "multer"; 

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [AvatarsController],
  providers: [AvatarsService],
  exports: [AvatarsService],
})
export class AvatarsModule {}