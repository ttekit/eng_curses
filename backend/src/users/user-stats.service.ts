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
  private async filterExistingGenreIds(
    ids: number[] | undefined,
  ): Promise<number[]> {
    if (!ids?.length) {
      return [];
    }
    const numericUnique = [
      ...new Set(
        ids
          .map((raw) => {
            const n =
              typeof raw === "number" && Number.isFinite(raw)
                ? Math.trunc(raw)
                : parseInt(String(raw).trim(), 10);
            return Number.isFinite(n) && n > 0 ? n : NaN;
          })
          .filter((n): n is number => !Number.isNaN(n)),
      ),
    ];
    if (!numericUnique.length) {
      return [];
    }
    const rows = await this.prisma.genre.findMany({
      where: { id: { in: numericUnique } },
      select: { id: true },
    });
    return rows.map((g) => g.id);
  }

  private pickDefinedFields(
    record: Record<string, unknown>,
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(record).filter(([, v]) => v !== undefined),
    );
  }
}
