import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service"; // Укажи свой путь
import {
  CreateConstellationDto,
  CreateStarDto,
  UpdateConstellationDto,
  UpdateStarDto,
} from "./dto/constellation.dto";

@Injectable()
export class ConstellationService {
  constructor(private readonly prisma: PrismaService) { }

  async createConstellation(data: CreateConstellationDto) {
    return this.prisma.constellation.create({ data });
  }

  async getAllConstellations() {
    return this.prisma.constellation.findMany({
      include: { stars: true },
    });
  }

  async getConstellationById(id: number) {
    const constellation = await this.prisma.constellation.findUnique({
      where: { id },
      include: {
        stars: {
          include: { prerequisites: true },
        },
      },
    });
    if (!constellation) throw new NotFoundException("Constellation not found");
    return constellation;
  }

  async updateConstellation(id: number, data: UpdateConstellationDto) {
    try {
      return await this.prisma.constellation.update({
        where: { id },
        data,
      });
    } catch {
      throw new NotFoundException("Constellation not found");
    }
  }

  async deleteConstellation(id: number) {
    try {
      return await this.prisma.constellation.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException("Constellation not found");
    }
  }

  async createStar(data: CreateStarDto & { prerequisiteIds?: number[] }) {
    const { prerequisiteIds, ...restData } = data;

    return this.prisma.star.create({
      data: {
        ...restData,
        prerequisites: prerequisiteIds?.length
          ? {
            create: prerequisiteIds.map((id) => ({
              prerequisiteId: id,
            })),
          }
          : undefined,
      },
    });
  }

  async updateStar(id: number, data: UpdateStarDto) {
    const { prerequisiteIds, ...restData } = data;

    try {
      return await this.prisma.star.update({
        where: { id },
        data: {
          ...restData,
          ...(prerequisiteIds !== undefined && {
            prerequisites: {
              deleteMany: {},
              create: prerequisiteIds.map((prereqId) => ({
                prerequisiteId: prereqId,
              })),
            },
          }),
        },
        include: {
          prerequisites: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "Star not found or invalid prerequisite IDs provided",
      );
    }
  }
  async deleteStar(id: number) {
    try {
      return await this.prisma.star.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException("Star not found");
    }
  }

  async getStarById(id: number) {
    const star = await this.prisma.star.findUnique({
      where: { id },
    });
    if (!star) throw new NotFoundException("Star not found");
    return star;
  }
}
