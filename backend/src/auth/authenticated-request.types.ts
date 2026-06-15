import type { Request } from "express";
import type { AuthedUser } from "./auth.types";

/**
 * Express request after AuthGuard or LearnerJwtGuard attaches JWT subject.
 */
export type AuthedRequest = Request & {
  readonly user?: AuthedUser & { readonly id?: number };
};
