import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { TurnstileService } from '../provider/turnstile.provider'; 

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(private readonly turnstileService: TurnstileService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body?.captchaToken;

    if (!token) {
      throw new BadRequestException('CAPTCHA is required');
    }

    const ip = request.headers['x-forwarded-for'] || request.ip;
    const isValid = await this.turnstileService.validateToken(token, ip);

    if (!isValid) {
      throw new BadRequestException('The CAPTCHA verification failed or the token has expired');
    }

    return true;
  }
}