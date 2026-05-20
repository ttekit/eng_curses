import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Request as ReqDecorator,
  Param,
  Res,
  Query,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
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

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly providerService: ProviderService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

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
  async confirmEmail(
    @Query("token") token: string,
    //@Res() res: Response
  ) {
    await this.authService.confirmEmail(token);
    // const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173";
    // return res.redirect(`${frontendUrl}/email-success`);
    return {
      success: true,
      message: "Email successfully confirmed",
    };
  }

  @UseGuards(AuthGuard)
  @Post("update-preferences")
  async updatePreferences(@ReqDecorator() req: any, @Body() body: any) {
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
    console.log("Расшифрованный токен:", req.user);
    return await this.authService.updatePassword(req.user.sub, dto);
  }

  @UseGuards(AuthGuard)
  @Post("update-email")
  async updateEmail(@Req() req: any, @Body() dto: UpdateEmailDto) {
    return this.authService.updateEmail(req.user.sub, dto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @Post("profile")
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
}
