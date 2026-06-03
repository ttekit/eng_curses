import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { extractAccessTokenFromRequest } from "../extract-request-access-token.util";
import type { AuthedUser } from "../auth.types";

type AuthedRequest = Request & { user?: AuthedUser };

/**
 * Sets `req.user` when a valid learner JWT is present; allows anonymous access otherwise.
 */
@Injectable()
export class OptionalLearnerJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const query = request.query as Record<string, string | undefined>;
    const body = request.body as { access_token?: string } | undefined;
    const fromBody =
      typeof body?.access_token === "string" ? body.access_token : undefined;
    const fromQuery =
      typeof query?.access_token === "string" ? query.access_token : undefined;
    const fromHeader = extractAccessTokenFromRequest(request);
    const token = fromHeader || fromQuery || fromBody;
    if (!token) {
      return true;
    }
    try {
      const secret = this.configService.getOrThrow<string>("JWT_SECRET");
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(token, { secret });
      request.user = { sub: payload.sub, email: payload.email };
    } catch {
      /* invalid token treated as anonymous */
    }
    return true;
  }
}
