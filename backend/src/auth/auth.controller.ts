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

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
  ) { }

  @Post("register")
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

  @Post("login")
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

  @Post("verify-email")
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

  @Post("resend-confirmation")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email confirmation" })
  @ApiBody({ schema: { properties: { email: { type: "string" } } } })
  async resendConfirmation(@Body("email") email: string) {
    return await this.authService.resendConfirmationEmail(email);
  }

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
  @SetMetadata("IS_PUBLIC_KEY", true)
  @Post("update-preferences")
  async updatePreferences(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      console.error("DEBUG: ID пользователя не найден в req.user:", req.user);
      throw new UnauthorizedException(
        "Авторизація не вдалася: ID користувача відсутній",
      );
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

  @Post("verify-2fa")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify 2FA code during login (No Captcha)" })
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
        "DEBUG PROFILE: Неверный или отсутствующий ID в req.user:",
        req.user,
      );
      throw new UnauthorizedException(
        "Не удалось определить профиль пользователя",
      );
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

  @Get("/oauth/callback/:provider")
  @UseGuards(AuthProviderGuard)
  public async callback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query("code") code: string,
    @Param("provider") provider: string,
  ) {
    if (!code) {
      throw new BadRequestException("");
    }

    await this.authService.extractProfileFromCode(req, provider, code);

    req.session.save((err) => {
      if (err) {
        console.error("Error save session in Redis:", err);
        throw new InternalServerErrorException("Failed to save session");
      }

      const redirectUrl = `${this.configService.getOrThrow<string>("FRONTEND_URL")}/dashboard/settings`;
      res.redirect(redirectUrl);
    });
  }

  @UseGuards(AuthProviderGuard)
  @Get("/oauth/connect/:provider")
  public async connect(@Param("provider") provider: string) {
    const providerInstance = this.providerService.findByService(provider);

    return {
      url: providerInstance!.getAuthUrl(),
    };
  }

  @UseGuards(AuthGuard)
  @Delete("delete-account")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete user account" })
  async deleteAccount(@Req() req: any, @Body() dto: DeleteAccountDto) {
    return await this.authService.deleteAccount(req.user.sub, dto);
  }

  @Post("restore-account")
  async restoreAccount(@Body() body: { token: string }) {
    return this.authService.restoreAccount(body.token);
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email confirmation code" })
  async resendVerification(@Body() body: { email: string }) {
    return await this.authService.resendConfirmationEmail(body.email);
  }
}