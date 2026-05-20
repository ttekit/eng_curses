import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly cloudflareUrl =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validateToken(token: string, remoteIp?: string): Promise<boolean> {
    const secretKey = this.configService.get<string>(
      "CLOUDFLARE_TURNSTILE_SECRET_KEY",
    );

    if (!secretKey) {
      this.logger.error("No secret key");
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.cloudflareUrl,
          new URLSearchParams({
            secret: secretKey,
            response: token,
            ...(remoteIp && { remoteip: remoteIp }),
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        ),
      );

      return response.data?.success === true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        "Error verifying the Turnstile token",
        errorMessage,
      );
      return false;
    }
  }
}
