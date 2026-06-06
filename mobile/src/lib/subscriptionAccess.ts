/**
 * Subscription gate helpers (mirrors `frontend/src/lib/subscriptionAccess.ts`).
 */
import type { UserData } from "../types/user";
import { subscriptionEnforcementDisabled } from "./config";

export function userHasPaidSubscription(user: UserData | null): boolean {
  if (!user) return false;
  const s = (user.subscriptionStatus ?? "").trim().toLowerCase();
  return s === "active" || s === "trialing";
}

export function userExemptFromSubscription(user: UserData | null): boolean {
  if (!user) return false;
  if (user.role === "teacher" || user.role === "admin") return true;
  if (user.teacherId != null) return true;
  return false;
}

export function userMayUseLearnerApp(user: UserData | null): boolean {
  if (subscriptionEnforcementDisabled()) return true;
  if (!user) return false;
  if (userExemptFromSubscription(user)) return true;
  return userHasPaidSubscription(user);
}
