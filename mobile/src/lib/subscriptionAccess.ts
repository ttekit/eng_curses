/**
 * Subscription gate helpers (mirrors `frontend/src/lib/subscriptionAccess.ts`).
 */
import type { UserData } from "../types/user";
import { subscriptionEnforcementDisabled } from "./config";

function user_has_paid_subscription(user: UserData | null): boolean {
  if (!user) return false;
  const s = (user.subscriptionStatus ?? "").trim().toLowerCase();
  return s === "active" || s === "trialing";
}

function user_exempt_from_subscription(user: UserData | null): boolean {
  if (!user) return false;
  if (user.role === "teacher" || user.role === "admin") return true;
  if (user.teacherId != null) return true;
  return false;
}

export function userMayUseLearnerApp(user: UserData | null): boolean {
  if (subscriptionEnforcementDisabled()) return true;
  if (!user) return false;
  if (user_exempt_from_subscription(user)) return true;
  return user_has_paid_subscription(user);
}
