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
import type { AuthedRequest } from "./authenticated-request.types";
import { resolve_authed_user_id } from "./jwt-subject.util";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { SaveWordDto } from "./dto/save-word.dto";
import { SmtpService } from "./smtp.service";
import { UserProfile } from "src/users/user-profile.service";
import { AccountManagementService } from "src/users/account-management.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
    private readonly studyingPlanRegeneration: StudyingPlanRegenerationService,
    private readonly smtpService: SmtpService,
    private readonly userProfile: UserProfile,
    private readonly accountManagementService: AccountManagementService,
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
    return await this.smtpService.verifyEmailCode(body.email, body.code);
  }

  @Public()
  @Post("resend-confirmation")
  @SkipSubscriptionCheck()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email confirmation" })
  @ApiBody({ schema: { properties: { email: { type: "string" } } } })
  async resendConfirmation(@Body("email") email: string) {
    return await this.smtpService.resendConfirmationEmail(email);
  }

  @Public()
  @Get("confirm-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm user email via token" })
  @ApiQuery({ name: "token", type: "string" })
  async confirmEmail(@Query("token") token: string) {
    await this.smtpService.confirmEmail(token);
    return {
      success: true,
      message: "Email successfully confirmed",
    };
  }

  @UseGuards(AuthGuard)
  @Post("update-preferences")
  @SkipSubscriptionCheck()
  async updatePreferences(
    @Req() req: AuthedRequest,
    @Body() body: UpdatePreferencesDto,
  ) {
    const userId = resolve_authed_user_id(req.user);
    return this.authService.updateUserPreferences(userId, body);
  }

  @UseGuards(AuthGuard)
  @Post("update-password")
  async updatePassword(
    @Req() req: AuthedRequest,
    @Body() dto: UpdatePasswordDto,
  ) {
    return await this.userProfile.updatePassword(
      resolve_authed_user_id(req.user),
      dto,
    );
  }

  @UseGuards(AuthGuard)
  @Post("toggle-2fa")
  @HttpCode(HttpStatus.OK)
  public async toggleTwoFactor(
    @Req() req: AuthedRequest,
    @Body() dto: ToggleTwoFactorDto,
  ) {
    return this.smtpService.toggleTwoFactor(
      resolve_authed_user_id(req.user),
      dto,
    );
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
  async saveWord(@Req() req: AuthedRequest, @Body() body: SaveWordDto) {
    return this.authService.saveWordToVocabulary(
      resolve_authed_user_id(req.user),
      body,
    );
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
  getProfile(@Req() req: AuthedRequest) {
    return this.authService.getProfile(resolve_authed_user_id(req.user));
  }

  @Post("send-email-change-code")
  @UseGuards(AuthGuard)
  async sendEmailChangeCode(@Req() req: AuthedRequest) {
    return this.smtpService.sendEmailChangeCode(
      resolve_authed_user_id(req.user),
    );
  }

  @Post("verify-email-change")
  @UseGuards(AuthGuard)
  async verifyAndChangeEmail(
    @Req() req: AuthedRequest,
    @Body() dto: VerifyEmailChangeDto,
  ) {
    return this.smtpService.verifyAndChangeEmail(
      resolve_authed_user_id(req.user),
      dto,
    );
  }

  @Post("check-email-change-code")
  @UseGuards(AuthGuard)
  async checkEmailChangeCode(
    @Req() req: AuthedRequest,
    @Body("code") code: string,
  ) {
    return this.smtpService.checkEmailChangeCode(
      resolve_authed_user_id(req.user),
      code,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Get("profile/learning-stats")
  @ApiOperation({
    summary:
      "Learning dashboard stats (watch time, quizzes, Mon–Sun weekly activity UTC)",
  })
  @ApiResponse({ status: 200, description: "Stats retrieved." })
  getLearningStats(@Req() req: AuthedRequest) {
    return this.authService.getLearningStats(resolve_authed_user_id(req.user));
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Get("profile/knowledge-tags")
  @ApiOperation({
    summary:
      "Topic-tag knowledge (listening / vocabulary / grammar means from UserLanguageData)",
  })
  @ApiResponse({ status: 200, description: "Tag aggregates returned." })
  getKnowledgeTags(@Req() req: AuthedRequest) {
    return this.authService.getKnowledgeTagProgress(
      resolve_authed_user_id(req.user),
    );
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
  refreshKnowledgeTags(@Req() req: AuthedRequest) {
    return this.authService.refreshKnowledgeTagProgress(
      resolve_authed_user_id(req.user),
    );
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
  getProgressDetails(@Req() req: AuthedRequest) {
    return this.authService.getProgressDetails(
      resolve_authed_user_id(req.user),
    );
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
  async regenerateStudyingPlan(@Req() req: AuthedRequest) {
    const userId = resolve_authed_user_id(req.user);
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
      return res.redirect(
        `${this.configService.getOrThrow<string>("FRONTEND_URL")}/loginForm`,
      );
    }

    try {
      const result = await this.authService.extractProfileFromCode(
        req,
        provider,
        code,
      );

      const isNewUser = result.isNewUser;
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
    @Req() req: AuthedRequest,
    @Body("action") action: "delete" | "reset",
  ) {
    if (action !== "delete" && action !== "reset") {
      throw new BadRequestException("Invalid action type");
    }
    return await this.accountManagementService.sendDangerZoneCode(
      resolve_authed_user_id(req.user),
      action,
    );
  }

  @UseGuards(AuthGuard)
  @Delete("delete-account")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user account using OTP" })
  async deleteAccount(
    @Req() req: AuthedRequest,
    @Body() body: { code: string },
  ) {
    return await this.accountManagementService.deleteAccount(
      resolve_authed_user_id(req.user),
      body.code,
    );
  }

  @Public()
  @Post("restore-account")
  async restoreAccount(@Body() body: { token: string }) {
    return this.accountManagementService.restoreAccount(body.token);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email confirmation code" })
  async resendVerification(@Body() body: { email: string }) {
    return await this.smtpService.resendConfirmationEmail(body.email);
  }
}
