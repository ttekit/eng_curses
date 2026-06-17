import {
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AlcorythmService } from "src/alcorythm/alcorythm.service";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserStatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alcorythmService: AlcorythmService,
    private readonly configService: ConfigService,
  ) {}

  
}
