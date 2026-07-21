import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  Patch,
  Delete,
} from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { ConstellationGeneratorService } from "./constellation-generator.service";
import { ConstellationProgressService } from "./constellation-progress.service";
import {
  CreateConstellationDto,
  CreateStarDto,
  UpdateConstellationDto,
  UpdateStarDto,
} from "./dto/constellation.dto";
import { ConstellationService } from "./constellation.service";

@Controller("constellations")
export class ConstellationController {
  constructor(
    private readonly generatorService: ConstellationGeneratorService,
    private readonly progressService: ConstellationProgressService,
    private readonly crudService: ConstellationService,
  ) {}

  @Post("generate")
  @UseGuards(JwtAdminGuard)
  async generateConstellation(
    @Body() body: { domain: string; cefrLevel: string },
  ) {
    return this.generatorService.generateAndSaveConstellation(
      body.domain,
      body.cefrLevel,
    );
  }

  @Get(":id/graph")
  @UseGuards(AuthGuard)
  async getGraph(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.progressService.getOptimizedConstellationGraph(userId, id);
  }

  @Post("stars/:starId/complete")
  @UseGuards(AuthGuard)
  async completeStar(
    @Param("starId", ParseIntPipe) starId: number,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.progressService.completeStar(userId, starId);
  }
  @Post()
  @UseGuards(JwtAdminGuard)
  async createConstellation(@Body() dto: CreateConstellationDto) {
    return this.crudService.createConstellation(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllConstellations() {
    return this.crudService.getAllConstellations();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getConstellationById(@Param("id", ParseIntPipe) id: number) {
    return this.crudService.getConstellationById(id);
  }

  @Patch(":id")
  @UseGuards(JwtAdminGuard)
  async updateConstellation(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateConstellationDto,
  ) {
    return this.crudService.updateConstellation(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAdminGuard)
  async deleteConstellation(@Param("id", ParseIntPipe) id: number) {
    return this.crudService.deleteConstellation(id);
  }

  @Post("stars")
  @UseGuards(JwtAdminGuard)
  async createStar(@Body() dto: CreateStarDto) {
    return this.crudService.createStar(dto);
  }

  @Patch("stars/:starId")
  @UseGuards(JwtAdminGuard)
  async updateStar(
    @Param("starId", ParseIntPipe) starId: number,
    @Body() dto: UpdateStarDto,
  ) {
    return this.crudService.updateStar(starId, dto);
  }

  @Delete("stars/:starId")
  @UseGuards(JwtAdminGuard)
  async deleteStar(@Param("starId", ParseIntPipe) starId: number) {
    return this.crudService.deleteStar(starId);
  }
}
