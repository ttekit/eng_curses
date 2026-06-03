import type { UserRole } from "@generated/prisma/enums";

/**
 * JWT subject attached to the request after AuthGuard or LearnerJwtGuard.
 */
export interface AuthedUser {
  readonly sub: number;
  readonly email: string;
  readonly role?: UserRole;
}
