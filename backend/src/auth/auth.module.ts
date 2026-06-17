import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AlcorythmModule } from "../alcorythm/alcorythm.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { AuthProfileService } from "./auth-profile.service";
import { AuthLearningStatsService } from "./auth-learning-stats.service";
import { AuthKnowledgeTagsService } from "./auth-knowledge-tags.service";
import { AuthProgressDetailsService } from "./auth-progress-details.service";
import { ApiTokenOrJwtAuthGuard } from "./guards/api-token-or-jwt.guard";
import { ApiTokenOnlyGuard } from "./guards/api-token-only.guard";
import { JwtAdminGuard } from "./guards/jwt-admin.guard";
import { UserSelfOrApiGuard } from "./guards/user-self-or-api.guard";
import { UsersService } from "src/users/users.service";
import { ProviderModule } from "./provider/provider.module";
import { getProvidersConfig } from "src/config/providers.config";
import { EmailConfirmationModule } from "./email-confirmation/email-confirmation.module";
import { MailModule } from "src/common/mail/mail.module";
import { TwoFactorAuthService } from "./two-factor-auth/two-factor-auth.service";
import { PasswordRecoveryController } from "./password-recovery/password-recovery.controller";
import { PasswordRecoveryService } from "./password-recovery/password-recovery.service";
import { TurnstileGuard } from "./guards/turnstile.guard";
import { LearnerJwtGuard } from "./guards/learner-jwt.guard";
import { OptionalLearnerJwtGuard } from "./guards/optional-learner-jwt.guard";
import { StudyingPlanModule } from "src/studying-plan/studying-plan.module";
import { SmtpService } from "./smtp.service";
import { UserProfile } from "src/users/user-profile.service";
import { AccountManagementService } from "src/users/account-management.service";

@Module({
  imports: [
    MailModule,
    ProviderModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getProvidersConfig,
      inject: [ConfigService],
    }),
    AlcorythmModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => EmailConfirmationModule),
    StudyingPlanModule,
  ],
  controllers: [AuthController, PasswordRecoveryController],
  providers: [
    SmtpService,
    UserProfile,
    AccountManagementService,
    AuthService,
    AuthProfileService,
    AuthLearningStatsService,
    AuthKnowledgeTagsService,
    AuthProgressDetailsService,
    AuthGuard,
    ApiTokenOrJwtAuthGuard,
    ApiTokenOnlyGuard,
    JwtAdminGuard,
    UserSelfOrApiGuard,
    TurnstileGuard,
    LearnerJwtGuard,
    OptionalLearnerJwtGuard,
    UsersService,
    TwoFactorAuthService,
    PasswordRecoveryService,
  ],
  exports: [
    JwtModule,
    AuthService,
    AuthProfileService,
    AuthLearningStatsService,
    AuthKnowledgeTagsService,
    AuthProgressDetailsService,
    AuthGuard,
    ApiTokenOrJwtAuthGuard,
    ApiTokenOnlyGuard,
    JwtAdminGuard,
    UserSelfOrApiGuard,
    TurnstileGuard,
    LearnerJwtGuard,
    OptionalLearnerJwtGuard,
  ],
})
export class AuthModule {}
