import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import type { Redis } from "ioredis";
import { PrismaService } from "../../prisma.service";
import {
  hasPaidSubscriptionAccess,
  isSubscriptionEnforcementDisabled,
} from "../../billing/subscription-access.util";
import {
  readSubscriptionAccessCache,
  writeSubscriptionAccessCache,
} from "../../billing/subscription-access-cache.util";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { UserRole } from "@generated/prisma/enums";
import { extractAccessTokenFromRequest } from "../extract-request-access-token.util";
import { SKIP_SUBSCRIPTION_CHECK_KEY } from "../decorators/skip-subscription-check.decorator";

type RoutedRequest = Request & {
  route?: { path?: string };
};

@Injectable()
export class RequireActiveSubscriptionGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RoutedRequest>();

    if (req.method === "OPTIONS") {
      return true;
    }

    const nodeEnv = (
      this.config.get<string>("NODE_ENV") ??
      process.env.NODE_ENV ??
      ""
    )
      .trim()
      .toLowerCase();
    if (nodeEnv !== "production") {
      return true;
    }

    const skip = this.config.get<string>("SKIP_SUBSCRIPTION_ENFORCEMENT");
    if (isSubscriptionEnforcementDisabled(skip)) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const skipSubscription = this.reflector.getAllAndOverride<boolean>(
      SKIP_SUBSCRIPTION_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipSubscription) {
      return true;
    }

    const token = extractAccessTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedException(
        "Authentication required for this resource.",
      );
    }

    let sub: unknown;
    try {
      const secret = this.config.getOrThrow<string>("JWT_SECRET");
      const payload = await this.jwt.verifyAsync<{ sub: unknown }>(token, {
        secret,
      });
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const userId = Number(sub);
    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException("Invalid token subject");
    }

    let user = await readSubscriptionAccessCache(this.redis, userId);
    if (!user) {
      const fromDb = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          teacherId: true,
          subscriptionStatus: true,
        },
      });
      if (!fromDb) {
        throw new UnauthorizedException("User not found");
      }
      user = {
        role: fromDb.role,
        teacherId: fromDb.teacherId,
        subscriptionStatus: fromDb.subscriptionStatus,
      };
      await writeSubscriptionAccessCache(this.redis, userId, user).catch(
        () => {},
      );
    }

    if (
      user.role === UserRole.TEACHER ||
      user.role === UserRole.ADMIN ||
      user.teacherId != null
    ) {
      return true;
    }

    if (hasPaidSubscriptionAccess(user.subscriptionStatus)) {
      return true;
    }

    throw new ForbiddenException({
      message: "An active subscription is required to use this resource.",
      code: "SUBSCRIPTION_REQUIRED",
    });
  }
}
