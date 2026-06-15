import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TurnstileService } from "../provider/turnstile.provider";
import { should_skip_turnstile_for_mobile } from "./mobile-client.util";

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(
    private readonly turnstileService: TurnstileService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const nodeEnv = this.configService.get<string>("NODE_ENV");
    if (nodeEnv !== "production") {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (should_skip_turnstile_for_mobile(request)) {
      return true;
    }

    const token = request.body?.captchaToken;
    if (!token) {
      throw new BadRequestException("CAPTCHA is required");
    }

    const ip = request.headers["x-forwarded-for"] || request.ip;
    const isValid = await this.turnstileService.validateToken(token, ip);
    if (!isValid) {
      throw new BadRequestException(
        "The CAPTCHA verification failed or the token has expired",
      );
    }

    return true;
  }
}
