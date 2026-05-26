import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma.module";
import { PlacementTestModule } from "src/placement-test/placement-test.module";
import { PhaseFinalTestController } from "./phase-final-test.controller";
import { PhaseFinalTestService } from "./phase-final-test.service";

@Module({
  imports: [PrismaModule, PlacementTestModule],
  controllers: [PhaseFinalTestController],
  providers: [PhaseFinalTestService],
  exports: [PhaseFinalTestService],
})
export class PhaseFinalTestModule {}
