import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Param,
  Res,
  Query,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Delete,
  SetMetadata,
  Redirect,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "./auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthProviderGuard } from "./guards/provider.guard";
import { ProviderService } from "./provider/provider.service";
import { ConfigService } from "@nestjs/config";
import { type Request, type Response } from "express";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { TurnstileGuard } from "./guards/turnstile.guard";
import { UsersService } from "src/users/users.service";
import { ToggleTwoFactorDto } from "./dto/toggle-2fa.dto";
import { VerifyEmailChangeDto } from "./dto/verify-email-change.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { StudyingPlanRegenerationService } from "src/studying-plan/studying-plan-regeneration.service";
import { Throttle } from "@nestjs/throttler";
import { Public } from "./decorators/public.decorator";
import { SkipSubscriptionCheck } from "./decorators/skip-subscription-check.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
    private readonly studyingPlanRegeneration: StudyingPlanRegenerationService,
  ) {}

  @Public()
  @Post("register")
  @SkipSubscriptionCheck()
  @UseGuards(TurnstileGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered." })
  @ApiResponse({
    status: 400,
    description:
      "Bad request or unable to register with the provided information.",
  })
  @ApiBody({ type: RegisterDto })
  async register(@Req() req: Request, @Body() registerDto: RegisterDto) {
    return await this.authService.register(req, registerDto);
  }

  @Public()
  @Post("login")
  @SkipSubscriptionCheck()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @UseGuards(TurnstileGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in a user" })
  @ApiResponse({ status: 200, description: "User successfully logged in." })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post("verify-email")
  @SkipSubscriptionCheck()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify user email using 6-digit OTP code" })
  @ApiResponse({
    status: 200,
    description: "Email successfully verified. Returns access token.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid or expired verification code.",
  })
  async verifyEmail(@Body() body: { email: string; code: string }) {
    if (!body.email || !body.code) {
      throw new BadRequestException(
        "Email and verification code are required.",
      );
    }
    return await this.authService.verifyEmailCode(body.email, body.code);
  }

  @Public()
  @Post("resend-confirmation")
  @SkipSubscriptionCheck()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email confirmation" })
  @ApiBody({ schema: { properties: { email: { type: "string" } } } })
  async resendConfirmation(@Body("email") email: string) {
    return await this.authService.resendConfirmationEmail(email);
  }

  @Public()
  @Get("confirm-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm user email via token" })
  @ApiQuery({ name: "token", type: "string" })
  async confirmEmail(@Query("token") token: string) {
    await this.authService.confirmEmail(token);
    return {
      success: true,
      message: "Email successfully confirmed",
    };
  }

  @UseGuards(AuthGuard)
  @Post("update-preferences")
  @SkipSubscriptionCheck()
  async updatePreferences(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException("Login failed: User ID is missing");
    }

    return this.authService.updateUserPreferences(userId, body);
  }

  @UseGuards(AuthGuard)
  @Post("update-password")
  async updatePassword(@Req() req: any, @Body() dto: UpdatePasswordDto) {
    return await this.authService.updatePassword(req.user.sub, dto);
  }

  @UseGuards(AuthGuard)
  @Post("toggle-2fa")
  @HttpCode(HttpStatus.OK)
  public async toggleTwoFactor(
    @Req() req: any,
    @Body() dto: ToggleTwoFactorDto,
  ) {
    return this.authService.toggleTwoFactor(req.user.sub, dto);
  }

  @Public()
  @Post("verify-2fa")
  @SkipSubscriptionCheck()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @UseGuards(TurnstileGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify 2FA code during login" })
  @ApiBody({ type: LoginDto })
  async verifyTwoFactorLogin(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Post("vocabulary")
  @ApiOperation({ summary: "Save a word from video to vocabulary" })
  async saveWord(@Req() req: any, @Body() body: any) {
    return this.authService.saveWordToVocabulary(Number(req.user.sub), body);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Get("profile")
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: "Get user profile (requires authentication)" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  getProfile(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId || isNaN(Number(userId))) {
      console.error(
        "DEBUG PROFILE: Invalid or missing ID in req.user:",
        req.user,
      );
      throw new UnauthorizedException("Unable to determine the user's profile");
    }

    return this.authService.getProfile(Number(userId));
  }

  @Post("send-email-change-code")
  @UseGuards(AuthGuard)
  async sendEmailChangeCode(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.authService.sendEmailChangeCode(Number(userId));
  }

  @Post("verify-email-change")
  @UseGuards(AuthGuard)
  async verifyAndChangeEmail(
    @Req() req: any,
    @Body() dto: VerifyEmailChangeDto,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.authService.verifyAndChangeEmail(Number(userId), dto);
  }

  @Post("check-email-change-code")
  @UseGuards(AuthGuard)
  async checkEmailChangeCode(@Req() req: any, @Body("code") code: string) {
    const userId = req.user?.id || req.user?.sub;
    return this.authService.checkEmailChangeCode(Number(userId), code);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Get("profile/learning-stats")
  @ApiOperation({
    summary:
      "Learning dashboard stats (watch time, quizzes, Mon–Sun weekly activity UTC)",
  })
  @ApiResponse({ status: 200, description: "Stats retrieved." })
  getLearningStats(@Req() req: any) {
    const userId = Number(req.user.sub);
    return this.authService.getLearningStats(userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Get("profile/knowledge-tags")
  @ApiOperation({
    summary:
      "Topic-tag knowledge (listening / vocabulary / grammar means from UserLanguageData)",
  })
  @ApiResponse({ status: 200, description: "Tag aggregates returned." })
  getKnowledgeTags(@Req() req: any) {
    const userId = Number(req.user.sub);
    return this.authService.getKnowledgeTagProgress(userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Post("profile/refresh-knowledge-tags")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "DEV_MODE only: re-run topic knowledge inference and return tag aggregates",
  })
  @ApiResponse({ status: 200, description: "Tag aggregates refreshed." })
  @ApiResponse({ status: 403, description: "DEV_MODE is not enabled" })
  refreshKnowledgeTags(@Req() req: any) {
    const userId = Number(req.user.sub);
    return this.authService.refreshKnowledgeTagProgress(userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Get("profile/progress-details")
  @ApiOperation({
    summary: "Get aggregated profile metrics for dashboard progress charts",
  })
  @ApiResponse({
    status: 200,
    description: "Detailed summary data objects returned successfully.",
  })
  getProgressDetails(@Req() req: any) {
    const userId = Number(req.user.sub);
    return this.authService.getProgressDetails(userId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Post("profile/regenerate-studying-plan")
  @SkipSubscriptionCheck()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "Regenerate personalised studying plan (v2 JSON with DB topics per phase)",
  })
  @ApiResponse({
    status: 200,
    description: "Studying plan regenerated and saved.",
  })
  async regenerateStudyingPlan(
    @Req() req: { user?: { sub?: unknown; id?: unknown } },
  ) {
    const userId = Number(req.user?.sub ?? req.user?.id);
    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException("User id not found in token");
    }
    return this.studyingPlanRegeneration.regenerateForUser(userId);
  }

  @Public()
  @SkipSubscriptionCheck()
  @Get("/oauth/callback/:provider")
  @UseGuards(AuthProviderGuard)
  public async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Query("code") code: string,
    @Query("state") state: string,
    @Param("provider") provider: string,
  ) {
    if (!code) {
      return res.redirect(`${this.configService.getOrThrow<string>("FRONTEND_URL")}/loginForm`);
    }

    try {
      const result = await this.authService.extractProfileFromCode(
        req,
        provider,
        code,
      );

      const isNewUser = (result as any).isNewUser || false;
      const redirectUrl = `${this.configService.getOrThrow<string>("FRONTEND_URL")}/oauth/success?token=${result.access_token}&isNewUser=${isNewUser}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth Callback Error:", error);
      const errorUrl = `${this.configService.getOrThrow<string>("FRONTEND_URL")}/loginForm?error=oauth_failed`;
      return res.redirect(errorUrl);
    }
  }

  @Public()
  @SkipSubscriptionCheck()
  @UseGuards(AuthProviderGuard)
  @Get("/oauth/connect/:provider")
  @Redirect()
  public async connect(
    @Param("provider") provider: string,
    @Query("action") action?: string,
  ) {
    const providerInstance = this.providerService.findByService(provider);

    return {
      url: providerInstance!.getAuthUrl(action),
    };
  }

  @UseGuards(AuthGuard)
  @Post("send-danger-zone-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send OTP for danger zone actions" })
  async sendDangerZoneCode(
    @Req() req: any,
    @Body("action") action: "delete" | "reset",
  ) {
    if (action !== "delete" && action !== "reset") {
      throw new BadRequestException("Invalid action type");
    }
    return await this.authService.sendDangerZoneCode(req.user.sub, action);
  }

  @UseGuards(AuthGuard)
  @Delete("delete-account")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user account using OTP" })
  async deleteAccount(@Req() req: any, @Body() body: { code: string }) {
    return await this.authService.deleteAccount(req.user.sub, body.code);
  }

  @Public()
  @Post("restore-account")
  async restoreAccount(@Body() body: { token: string }) {
    return this.authService.restoreAccount(body.token);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email confirmation code" })
  async resendVerification(@Body() body: { email: string }) {
    return await this.authService.resendConfirmationEmail(body.email);
  }
}
