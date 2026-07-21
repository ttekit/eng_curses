import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { LearnerJwtGuard } from "src/auth/guards/learner-jwt.guard";
import { extractAccessTokenFromRequest } from "src/auth/extract-request-access-token.util";
import { resolveFrameAncestorsCsp } from "src/common/utils/frame-ancestors-csp.util";
import { PhaseFinalTestService } from "./phase-final-test.service";
import { placementDict } from "src/placement-test/placement-dict";

type AuthedRequest = Request & { user: { sub: number; email: string } };

function inferApiPublicOrigin(req: Request): string {
  const xf = req.headers["x-forwarded-proto"];
  const raw = typeof xf === "string" ? xf.split(",")[0]?.trim() : undefined;
  const proto = (raw || req.protocol || "http").replace(/:$/, "");
  const host = req.get("host");
  if (!host) return "";
  return `${proto}://${host}`;
}

function getBearerOrQueryToken(req: Request): string {
  const fromHeader = extractAccessTokenFromRequest(req);
  if (fromHeader) {
    return fromHeader;
  }
  const q = req.query as Record<string, string | undefined>;
  if (typeof q?.access_token === "string" && q.access_token.length > 0) {
    return q.access_token;
  }
  return "";
}

@Controller("phase-final-test")
@ApiTags("phase-final-test")
export class PhaseFinalTestController {
  constructor(
    private readonly phaseFinalTest: PhaseFinalTestService,
    private readonly config: ConfigService,
  ) {}

  @Get("status")
  @UseGuards(LearnerJwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("api-token")
  @ApiOperation({
    summary: "Phase final test status for the active studying phase",
  })
  @ApiOkResponse({ description: "Status payload" })
  status(@Req() req: AuthedRequest) {
    return this.phaseFinalTest.getStatus(req.user.sub);
  }

  @Get("document")
  @UseGuards(LearnerJwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("api-token")
  @ApiQuery({
    name: "access_token",
    required: false,
    description: "JWT for iframe src when Authorization is unavailable",
  })
  @ApiOperation({
    summary: "Phase final test HTML (iframe) for the current active phase",
  })
  @ApiProduces("text/html")
  @Header("Content-Type", "text/html; charset=utf-8")
  @Header("Cache-Control", "no-store")
  async document(@Req() req: AuthedRequest, @Res() res: Response) {
    const frameAncestors = resolveFrameAncestorsCsp(
      this.config,
      "PLACEMENT_TEST_FRAME_ANCESTORS",
    );
    res.setHeader(
      "Content-Security-Policy",
      `frame-ancestors ${frameAncestors}`,
    );
    const langCode = req.query?.lang === "uk" ? "uk" : "en";

    const t = placementDict[langCode];

    const html = await this.phaseFinalTest.renderDocumentHtml(
      req.user.sub,
      getBearerOrQueryToken(req),
      inferApiPublicOrigin(req),
      t
    );
    res.send(html);
  }

  @Post("complete")
  @UseGuards(LearnerJwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("api-token")
  @ApiOperation({ summary: "Submit phase final test answers" })
  @ApiBody({
    required: false,
    schema: {
      type: "object",
      properties: {
        access_token: { type: "string" },
        answers: {
          type: "object",
          additionalProperties: { type: "number" },
        },
      },
    },
  })
  @ApiCreatedResponse({ description: "Grading result" })
  complete(@Req() req: AuthedRequest, @Body() body: Record<string, unknown>) {
    return this.phaseFinalTest.completePhaseFinalTest(req.user.sub, {
      access_token:
        typeof body?.access_token === "string" ? body.access_token : undefined,
      answers:
        body?.answers && typeof body.answers === "object"
          ? (body.answers as Record<string, number>)
          : undefined,
    });
  }
}
