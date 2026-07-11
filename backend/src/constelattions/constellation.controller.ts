import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseGuards,
    Req,
    ParseIntPipe,
} from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { ConstellationGeneratorService } from "./constellation-generator.service";
import { ConstellationProgressService } from "./constellation-progress.service";

@Controller("constellations")
export class ConstellationController {
    constructor(
        private readonly generatorService: ConstellationGeneratorService,
        private readonly progressService: ConstellationProgressService,
    ) { }

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
}