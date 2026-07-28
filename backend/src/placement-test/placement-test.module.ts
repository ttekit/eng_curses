import { Module } from "@nestjs/common";
import { AlcorythmModule } from "../alcorythm/alcorythm.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma.module";
import { PlacementTestController } from "./placement-test.controller";
import { PlacementTestService } from "./placement-test.service";
import { ConstellationModule } from "src/constelattions/constellation.module";

@Module({
  imports: [PrismaModule, AlcorythmModule, AuthModule, ConstellationModule],
  controllers: [PlacementTestController],
  providers: [PlacementTestService],
  exports: [PlacementTestService],
})
export class PlacementTestModule { }