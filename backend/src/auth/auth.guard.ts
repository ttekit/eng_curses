import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { extractAccessTokenFromRequest } from "./extract-request-access-token.util";
import { isEmailConfirmationDisabled } from "src/common/utils/outbound-mail-disabled.util";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractAccessTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException("Token not found");
    }

    let payload: any;
    try {
      const secret = this.configService.getOrThrow<string>("JWT_SECRET");
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const userId = payload.sub || payload.id;

    if (!userId) {
      throw new UnauthorizedException("Invalid token payload structure");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        isSuspended: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User account no longer exists");
    }

    if (user.isSuspended) {
      throw new ForbiddenException("Account has been suspended");
    }

    if (
      user.isVerified === false &&
      !isEmailConfirmationDisabled(this.configService)
    ) {
      throw new ForbiddenException("Account email is not verified");
    }

    request["user"] = payload;
    return true;
  }
}
