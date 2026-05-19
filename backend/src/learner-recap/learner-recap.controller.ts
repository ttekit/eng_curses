import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { LearnerRecapService } from "./learner-recap.service";
import type { RecapKind } from "./recap-grading-token.util";

function parseRecapKind(raw: string): RecapKind {
  if (raw === "mistakes" || raw === "weekly" || raw === "monthly") {
    return raw;
  }
  throw new BadRequestException("Invalid recap kind");
}

@ApiTags("learner-recap")
@Controller("learner-recap")
export class LearnerRecapController {
  constructor(private readonly learnerRecap: LearnerRecapService) {}

  @Get("status")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Training hub availability (mistakes / weekly / monthly)",
  })
  getStatus(@Req() req: Request & { user: unknown }) {
    const userId = jwtSubToUserId(req.user);
    return this.learnerRecap.getStatus(userId);
  }

  @Post(":kind/generate")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Generate a recap quiz when the cooldown allows" })
  generate(
    @Param("kind") kindRaw: string,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    const kind = parseRecapKind(kindRaw);
    return this.learnerRecap.generate(userId, kind);
  }

  @Post(":kind/submit")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Submit recap answers and record cooldown" })
  submit(
    @Param("kind") kindRaw: string,
    @Body() body: { token?: string; answers?: Record<string, number> },
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    const kind = parseRecapKind(kindRaw);
    return this.learnerRecap.submit(userId, kind, {
      token: body?.token ?? "",
      answers: body?.answers ?? {},
    });
  }
}
