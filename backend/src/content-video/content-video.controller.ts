import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { LearnerJwtGuard } from "src/auth/guards/learner-jwt.guard";
import { OptionalLearnerJwtGuard } from "src/auth/guards/optional-learner-jwt.guard";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";
import { SkipSubscriptionCheck } from "src/auth/decorators/skip-subscription-check.decorator";
import { resolveFrameAncestorsCsp } from "src/common/utils/frame-ancestors-csp.util";
import {
  jwtSubToUserId,
  optionalJwtSubToUserId,
} from "src/auth/jwt-subject.util";
import { renderComprehensionTestsIframeHtml } from "src/content-video/content-video-comprehension-tests-html";
import { ContentVideoComprehensionTestsService } from "src/content-video/content-video-comprehension-tests.service";
import { PostWatchSurveyService } from "src/content-video/post-watch-survey.service";
import { VideoTranscriptTagsService } from "src/contents/video-transcript-tags.service";
import { VideoCaptionsService } from "src/contents/video-captions.service";
import { ContentVideoService } from "./content-video.service";
import { CreateContentVideoDto } from "./dto/create-content-video.dto";
import { ComprehensionSummaryRecommendationsBodyDto } from "./dto/summary-recommendations.dto";
import { UpdateContentVideoDto } from "./dto/update-content-video.dto";
import { VocabularyHintsService } from "src/content-video/vocabulary-hints.service";
import { VocabularyPersonalizationService } from "src/content-video/vocabulary-personalization.service";
import { PrismaService } from "src/prisma.service";
import { Public } from "src/auth/decorators/public.decorator";

@ApiTags("content-video")
@Controller("content-video")
export class ContentVideoController {
  constructor(
    private readonly config: ConfigService,
    private readonly contentVideoService: ContentVideoService,
    private readonly videoTranscriptTags: VideoTranscriptTagsService,
    private readonly videoCaptionsService: VideoCaptionsService,
    private readonly postWatchSurveyService: PostWatchSurveyService,
    private readonly comprehensionTestsService: ContentVideoComprehensionTestsService,
    private readonly vocabularyHintsService: VocabularyHintsService,
    private readonly vocabularyPersonalizationService: VocabularyPersonalizationService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Admin: Create a new video entity" })
  create(@Body() createContentVideoDto: CreateContentVideoDto) {
    return this.contentVideoService.create(createContentVideoDto);
  }

  @Get("public")
  @Public()
  @SkipSubscriptionCheck()
  @ApiOperation({
    summary: "Public catalog safe preview (no video links)",
    description:
      "Returns catalog metadata for unauthenticated users without exposing private HLS streams.",
  })
  findPublicCatalog() {
    return this.contentVideoService.findAllPublicCatalog();
  }

  @Get()
  @SkipSubscriptionCheck()
  @UseGuards(OptionalLearnerJwtGuard)
  @ApiOperation({
    summary:
      "Get all videos (supports unlisted teacher videos if authenticated)",
  })
  findAll(@Req() req: Request & { user?: unknown }) {
    const userId = optionalJwtSubToUserId(req.user);
    return this.contentVideoService.findAll(userId);
  }

  @Get("watched")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Watched lessons for the signed-in learner",
    description:
      "Returns distinct catalog videos where the user has at least one `WatchSession`, newest first.",
  })
  findWatchedForLearner(@Req() req: Request & { user: unknown }) {
    const userId = jwtSubToUserId(req.user);
    return this.contentVideoService.findWatchedByUser(userId);
  }

  @Post("vocabulary-hints")
  @ApiOperation({
    summary:
      "Hints for vocabulary cards: translation (optional target language), English pronunciation, simple English meaning",
  })
  async vocabularyHints(
    @Body() body: { words?: string[]; targetLang?: string | null } | undefined,
  ) {
    const words = Array.isArray(body?.words) ? body!.words! : [];
    const hints = await this.vocabularyHintsService.getHints(
      words,
      body?.targetLang ?? null,
    );
    return { hints };
  }

  @Post(":id/vocabulary-personalize")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Personalized vocabulary hints for signed-in learners (native translation + level-tuned gloss; gloss in native language when level is below B1)",
    description:
      "Call once when the learner starts watching. Requires the same key-vocab words as the lesson bundle.",
  })
  async vocabularyPersonalize(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { words?: string[] } | undefined,
    @Req() req: Request & { user: unknown },
  ) {
    const userId = jwtSubToUserId(req.user);
    const words = Array.isArray(body?.words) ? body!.words! : [];
    const hints =
      await this.vocabularyPersonalizationService.personalizeForUser({
        userId,
        contentVideoId: id,
        words,
      });
    return { hints };
  }

  @Post("surveys/:surveyId/submit")
  submitPostWatchSurvey(
    @Param("surveyId", ParseIntPipe) surveyId: number,
    @Body() body: { answers?: Record<string, unknown> },
  ) {
    return this.postWatchSurveyService.submitSurvey(
      surveyId,
      body?.answers ?? {},
    );
  }

  @Get(":id/iframe")
  @SkipSubscriptionCheck()
  @UseGuards(OptionalLearnerJwtGuard)
  getIframe(@Param("id") id: string, @Req() req: Request & { user?: unknown }) {
    const userId = optionalJwtSubToUserId(req.user);
    return this.contentVideoService.getIframePayload(id, userId);
  }

  @Get(":id")
  @SkipSubscriptionCheck()
  @UseGuards(OptionalLearnerJwtGuard)
  findOne(@Param("id") id: string, @Req() req: Request & { user?: unknown }) {
    const userId = optionalJwtSubToUserId(req.user);
    return this.contentVideoService.findOne(id, userId);
  }

  @Post(":id/regenerate-tags")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({
    summary: "Regenerate theme labels (userTags) from captions",
    description:
      "Re-analyzes the WebVTT transcript (Gemini) and updates ContentStats.userTags only. Requires captions.",
  })
  regenerateThemeTags(@Param("id", ParseIntPipe) id: number) {
    return this.videoTranscriptTags.regenerateTagsForContentVideo(
      id,
      "userTags",
    );
  }

  @Post(":id/regenerate-genres")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({
    summary: "Regenerate CEFR / level bands (systemTags) from captions",
    description:
      "Re-analyzes the transcript and updates ContentStats.systemTags and processingComplexity. UI label “genres” maps to level bands, not learner Genre prefs.",
  })
  regenerateLevelTags(@Param("id", ParseIntPipe) id: number) {
    return this.videoTranscriptTags.regenerateTagsForContentVideo(
      id,
      "systemTags",
    );
  }

  @Post(":id/regenerate-captions")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({
    summary: "Regenerate WebVTT captions",
    description:
      "Downloads MP4 from `videoLink`, FFmpeg extracts mono 16 kHz PCM WAV, POSTs `audio/wav` to Listen (`DEEPGRAM_TRANSCRIBE_MODEL`, default `nova-3`), writes WebVTT to S3, upserts `VideoCaptions`. Optional Gemini tag refresh after success.",
  })
  async regenerateCaptions(@Param("id", ParseIntPipe) id: number) {
    const row = await this.videoCaptionsService.generateCaptions(id);
    if (row === null) {
      throw new BadRequestException(
        "Caption generation could not run. Set DEEPGRAM_API_KEY and ensure FFmpeg can decode the video’s audio (see server logs). Optional: FFMPEG_PATH, DEEPGRAM_TRANSCRIBE_MODEL.",
      );
    }

    return {
      ok: true,
      contentVideoId: id,
      subtitlesFileLink: row.subtitlesFileLink,
      subtitlesUkLink: (
        await this.prisma.videoCaptions.findUnique({
          where: { contentVideoId: id },
        })
      )?.subtitlesUkLink,
    };
  }

  @Post(":id/regenerate-captions-uk")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({
    summary: "Manually generate Ukrainian subtitles",
    description: "Translates existing English captions to Ukrainian.",
  })
  async regenerateUkrainianCaptions(@Param("id", ParseIntPipe) id: number) {
    await this.videoCaptionsService.generateUkrainianSubtitlesManual(id);
    return {
      ok: true,
      contentVideoId: id,
    };
  }

  @Get(":id/captions")
  @SkipSubscriptionCheck()
  @UseGuards(OptionalLearnerJwtGuard)
  @ApiOperation({
    summary: "WebVTT captions (catalog learner UI)",
    description:
      "Returns the same `.vtt` stored for the lesson as `/subtitles`, without admin-only auth. Proxied from S3 via the API.",
  })
  @ApiProduces("text/vtt")
  @Header("Cache-Control", "public, max-age=120")
  async learnerCaptionsVtt(
    @Param("id") id: string,
    @Query("lang") lang: string | undefined,
    @Req() req: Request & { user?: unknown },
    @Res() res: Response,
  ): Promise<void> {
    const userId = optionalJwtSubToUserId(req.user);
    const video = await this.contentVideoService.findOne(id, userId);

    const numericId =
      typeof id === "number" || /^\d+$/.test(String(id))
        ? parseInt(String(id), 10)
        : video.id;

    const body = await this.videoCaptionsService.fetchStoredSubtitlesVtt(
      numericId,
      lang,
    );
    res.status(200).type("text/vtt; charset=utf-8").send(body);
  }

  @Get(":id/subtitles")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({
    summary: "Plain WebVTT (admin API token)",
    description:
      "Returns `text/vtt` for captions on S3. Requires `x-api-token` (same as other admin tooling). Use this from the admin SPA to avoid cross-origin fetches to the bucket.",
  })
  @ApiProduces("text/vtt")
  @Header("Cache-Control", "no-store")
  async adminSubtitlesText(
    @Param("id", ParseIntPipe) id: number,
    @Query("lang") lang: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    await this.contentVideoService.findOne(id);

    const body = await this.videoCaptionsService.fetchStoredSubtitlesVtt(
      id,
      lang,
    );
    res.status(200).type("text/vtt; charset=utf-8").send(body);
  }

  @Post(":id/watch-complete")
  @UseGuards(AuthGuard)
  async watchComplete(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: Request & { user: unknown },
    @Body() body: { secondsWatched?: number; completed?: boolean },
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.postWatchSurveyService.recordWatchAndGenerateSurvey(
      id,
      userId,
      body.secondsWatched || 0,
      body.completed,
    );
  }

  @Post(":id/tests/generate")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  generateComprehensionTests(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { userId?: number | null } | undefined,
  ) {
    return this.comprehensionTestsService.generate(id, body?.userId ?? null);
  }

  @Get(":id/tests")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary:
      "Get comprehension/grammar tests (fresh generation each request; optional userId for personalization)",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description:
      "Optional user for CEFR and saved vocabulary in metadata (same as POST /tests/generate).",
  })
  getComprehensionTests(
    @Param("id", ParseIntPipe) id: number,
    @Query("userId") userIdRaw: string | undefined,
    @Req() req: Request & { user?: { sub?: number } },
  ) {
    const fromJwt = jwtSubToUserId(req.user);
    const parsed =
      userIdRaw != null && userIdRaw !== ""
        ? Number.parseInt(userIdRaw, 10)
        : Number.NaN;
    const fromQuery = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    const userId = fromJwt > 0 ? fromJwt : fromQuery;
    return this.comprehensionTestsService.getOrLoadTests(id, userId);
  }

  @Get(":id/tests/iframe")
  @SkipSubscriptionCheck()
  @UseGuards(LearnerJwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiQuery({
    name: "access_token",
    required: false,
    description:
      "JWT when the iframe cannot send Authorization (same as placement test).",
  })
  @ApiOperation({
    summary:
      "Comprehension + grammar test as a standalone HTML page (iframe src)",
    description:
      "Generates the same test as POST …/tests/generate and returns `text/html` for embedding, " +
      'e.g. `<iframe src="{API}/content-video/1/tests/iframe?userId=2">` (userId is optional, for CEFR/vocab and saving topic scores). ' +
      "Submit results with POST /content-video/:id/tests/submit. " +
      "CSP: `COMPREHENSION_TEST_FRAME_ANCESTORS` or `*` default.",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    description:
      "Optional user id to tailor CEFR and saved vocabulary (same as POST body).",
  })
  @ApiQuery({
    name: "summaryBase",
    required: false,
    description:
      "After a successful submit, redirect the top window to this URL (e.g. https://app.example.com/test/comprehension-summary) with score query params.",
  })
  @ApiProduces("text/html")
  @Header("Content-Type", "text/html; charset=utf-8")
  @Header("Cache-Control", "no-store")
  async comprehensionTestsIframe(
    @Param("id", ParseIntPipe) id: number,
    @Query("userId") userIdRaw: string | undefined,
    @Query("summaryBase") summaryBase: string | undefined,
    @Req() req: Request & { user?: { sub?: number } },
    @Res() res: Response,
  ): Promise<void> {
    const frameAncestors = resolveFrameAncestorsCsp(
      this.config,
      "COMPREHENSION_TEST_FRAME_ANCESTORS",
    );
    res.setHeader(
      "Content-Security-Policy",
      `frame-ancestors ${frameAncestors}`,
    );
    const fromJwt = jwtSubToUserId(req.user);
    const parsed =
      userIdRaw != null && userIdRaw !== ""
        ? Number.parseInt(userIdRaw, 10)
        : Number.NaN;
    const fromQuery = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    const userId = fromJwt > 0 ? fromJwt : fromQuery;
    const result = await this.comprehensionTestsService.getOrLoadTests(
      id,
      userId,
    );
    const apiOrigin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    res.send(
      renderComprehensionTestsIframeHtml(result, apiOrigin, {
        summaryBase: summaryBase?.trim() || null,
      }),
    );
  }

  @Post(":id/tests/submit")
  @SkipSubscriptionCheck()
  @ApiOperation({
    summary:
      "Submit comprehension/grammar test; updates UserLanguageData for linked topics",
  })
  async submitComprehensionTest(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      token: string;
      answers: Record<string, number | string>;
      keyVocabularyTerms?: string[];
      keyVocabularyDetails?: Array<{
        term: string;
        nativeTranslation?: string | null;
        learnerDescription?: string | null;
      }>;
    },
  ) {
    return this.comprehensionTestsService.submit(id, body);
  }

  @Post(":id/summary-recommendations")
  @SkipSubscriptionCheck()
  @ApiOperation({
    summary:
      "Gemini: personalized summary, focus words, and next steps after a test (uses scores + vocabulary list)",
  })
  comprehensionSummaryRecommendations(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ComprehensionSummaryRecommendationsBodyDto,
  ) {
    return this.comprehensionTestsService.getSummaryRecommendations(id, body);
  }

  @Patch(":id")
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Admin: Update a video entity" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateContentVideoDto: UpdateContentVideoDto,
  ) {
    return this.contentVideoService.update(id, updateContentVideoDto);
  }

  @Delete(":id")
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Admin: Delete a video entity" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contentVideoService.remove(id);
  }
}
