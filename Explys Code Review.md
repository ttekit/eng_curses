**Project:** eng_curses (backend + frontend)
**Date:** 2026-05-25
**Scope:** Security, bugs, architecture, code quality, tests

---

  

## Executive Summary
The codebase delivers a full learning platform (NestJS + Prisma backend, React + Vite frontend), but **authorization is the primary risk**. Many write endpoints lack role checks, users can patch privileged fields on their own account, and the frontend relies on client-side paywall logic. Several **confirmed functional bugs** exist in registration and content flows. **Test coverage is essentially absent** on both sides.
**Recommended fix order:**
1. Authorization (DTOs, guards, remove secrets from SPA bundle)
2. Confirmed frontend bugs (token key, navigation, vocabulary hints, paywall)
3. Auth hardening (OTP, suspension checks, OAuth state)
4. Token/credential storage (httpOnly cookies, no passwords in sessionStorage)
5. Tests (guard matrix, registration flow, billing)

  

---
## Critical Issues  
##сделано
### 1. Self-service privilege escalation
**Severity:** Critical
**Files:**
- `backend/src/users/dto/update-user.dto.ts`

- `backend/src/users/users.service.ts`

- `backend/src/users/users.controller.ts`

**Problem:** `UpdateUserDto` inherits `role` from `CreateUserDto` and exposes `isSuspended` and `hasCompletedPlacement`. Authenticated users can patch their own record via `PATCH /users/:id` or `PATCH /users/profile`.
**Impact:** A learner JWT could set `role: "admin"`, clear suspension, or skip placement.
**Fix:** Split DTOs. User-facing updates should allow only safe fields. Admin-only fields behind `JwtAdminGuard`. Server-side allowlist in `update()`.

  
########################

  

##skip
### 2. Unauthenticated or weakly protected write endpoints
**Severity:** Critical
**Files:**
- `backend/src/contents/contents.controller.ts`
- `backend/src/content/content-video/content-video.controller.ts`
- Tags, categories, topics, content-stats, content-media controllers
**Problem:** Many mutation endpoints have no route-level auth guard. In development, `GlobalApiTokenGuard` is skipped. In production, protection relies on `x-api-token`, which the SPA ships via `VITE_API_TOKEN`.
**Impact:** Anyone with the token from the built JS can upload/delete content, mutate taxonomy, and trigger expensive AI generation.
**Fix:** Require JWT + role on all mutations. Never embed API tokens in the frontend bundle.

---
### 3. User data exposed without auth
**Severity:** Critical
**File:** `backend/src/content-recommendations/content-recommendations.controller.ts`
**Problem:** `GET /content-recommendations/for-user/:userId` has no guard.
**Impact:** Personalized recommendations for arbitrary user IDs can be fetched.
**Fix:** Require `AuthGuard`; enforce `userId === req.user.sub` (or admin).



##сделано
---
### 4. Auth guard does not re-check account status
**Severity:** Critical
**File:** `backend/src/auth/auth.guard.ts`
**Problem:** JWT signature is verified, but `isSuspended` and `isVerified` are not re-checked.
**Impact:** Suspended users keep API access until token expiry. Combined with issue #1, suspension is ineffective.
**Fix:** Load user status in guard and reject suspended/unverified users.

---
### 5. OTP brute-force surface
**Severity:** Critical
**Files:**
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/email-confirmation/email-confirmation.service.ts`
**Problem:** 6-digit codes use `Math.random()` (not CSPRNG). Verification endpoints lack rate limiting; only login/register use Turnstile.
**Impact:** ~1M guesses per account; feasible at scale.
**Fix:** Use `crypto.randomInt()`, per-email/IP throttling, lockout after N failures, captcha on verification endpoints.

---
### 6. Wrong token key breaks registration preferences
**Severity:** Critical (bug)
**File:** `frontend/src/pages/registration/RegistrationPreferences.tsx`
**Problem:** App stores JWT as `exply_access_token` (`lib/api.ts`), but preferences step reads `access_token`.
**Impact:** `Authorization: Bearer null` — registration step 3 fails.
**Fix:** Use `getStoredAccessToken()` from `lib/api.ts`; let `apiFetch` attach auth.

---
### 7. Duplicate navigation after email verification
**Severity:** Critical (bug)
**File:** `frontend/src/pages/registration/EmailVerification.tsx`
**Problem:** Login flow navigates to `/`, then a second block always runs and overwrites with registration routes.
**Impact:** Login-after-verification users are sent to registration instead of home.
**Fix:** Remove duplicate block (lines 75–83) or wrap in `else if (!isLoginFlow)`.

---
### 8. Inverted vocabulary-hints logic
**Severity:** Critical (bug)
**File:** `frontend/src/pages/content/ContentPage.tsx`
**Problem:** `if (user?.id != null) return;` — hints only load when user is **not** logged in.
**Impact:** Logged-in learners never get vocabulary hints.
**Fix:** Change to `if (user?.id == null) return;`.

---
### 9. Subscription paywall bypass via query string
**Severity:** Critical
**Files:**
- `frontend/src/components/RequireSubscriberAccess.tsx`

- `frontend/src/pages/subscription/SubscribePage.tsx`
**Problem:** `/catalog?checkout=success` bypasses paywall without server verification.
**Impact:** Any logged-in user without subscription can browse catalog.
**Fix:** Verify checkout server-side (Stripe session/webhook); use short-lived signed token instead of guessable query param.

---
### 10. Rules of Hooks violation in ProfileSettings
**Severity:** Critical (bug)
**File:** `frontend/src/components/profile/ProfileSettings.tsx`
**Problem:** Early `if (!user) return null;` before ~20 hook calls.
**Impact:** React hooks-order error if `user` becomes null after mount.
**Fix:** Move guard after all hooks, or split into wrapper + inner component.

---
## High Severity
| # | Issue | Location | Fix |
|---|--------|----------|-----|
| H1 | JWT in `localStorage` — XSS → account takeover | `frontend/src/lib/api.ts` | Prefer httpOnly cookies; tighten CSP |
| H2 | Registration passwords in `sessionStorage` | `RegistrationContext.tsx` | Exclude passwords from draft persistence |
| H3 | Unsandboxed placement iframe + unvalidated `postMessage` | `VideosPage.tsx` | Add `sandbox`; validate `ev.origin` |
| H4 | OAuth missing `state` (CSRF) | `google-provider.ts` | Generate/store/validate OAuth state |
| H5 | Legacy email confirmation has no expiry | `auth.service.ts` `confirmEmail()` | Unify on expiry-checked path |
| H6 | Plaintext student passwords in registration response | `auth.service.ts` | Email credentials; never return in JSON |
| H7 | Stale JWT after failed profile fetch | `UserContext.tsx` | Clear token on 401/403 |
| H8 | Login succeeds without token | `LoginForm.tsx` | Treat missing token as error |
| H9 | Placement skippable with empty draft → B1 default | `placement-test.service.ts` | Require valid draft before completion |
| H10 | `toggleTwoFactor` crashes for OAuth-only users | `auth.service.ts` | Handle null password |
| H11 | Hardcoded localhost restore URL in emails | `auth.service.ts` | Use `FRONTEND_URL` from config |
| H12 | 512MB global JSON body limit | `backend/src/main.ts` | Lower default; scope to specific routes |
| H13 | Stripe webhooks not idempotent | `billing.service.ts` | Store processed `event.id` |
| H14 | Token table: one row per email | Prisma schema | Separate by purpose or composite key |
| H15 | Admin auth is client-side only | `RequireAdmin.tsx` | Backend must enforce on all `/admin/*` |
| H16 | `VITE_API_BASIC_AUTH_*` bundled in client | `lib/api.ts`, `.env.example` | Dev proxy only; never in prod builds |

  

---

  

## Medium / Code Quality
### Backend
- `ValidationPipe` without `forbidNonWhitelisted: true` — extra body fields accepted
- Inconsistent password rules: register `MinLength(6)` vs login `MinLength(8)`
- `updatePreferences(@Body() body: any)` — no DTO validation
- `@Cron` cleanup in `users.service.ts` but no `ScheduleModule` — job never runs
- Throttling only on contents module; auth endpoints unthrottled
- Widespread `prisma as any` — hides schema drift
- Swagger at `/api` in all environments
- Default CSP `frame-ancestors *` when env unset (placement/comprehension tests)
- JWT in query string for placement iframe — referrer/log leakage
- Mixed RU/UK/EN error strings
### Frontend
- Heavy `as any` usage — type safety gaps
- `alert()` for errors in registration preferences
- Hardcoded Turnstile site key; env var unused
- Dead `CatalogPage.tsx` with mixed RU strings
- Split auth state: `isLoggedIn: !!user` vs token in storage
- Forgot password link non-functional (`href="#"` in `LoginForm.tsx`)
- Fetch effects without cancellation flags
- Catalog loads full videos as thumbnails when `thumbnailUrl` missing
- Entire video library fetched on mount — no pagination

---
## Testing & Observability

### Priority tests

  

1. Guard matrix — route → required auth

2. User self-update cannot change `role`, `isSuspended`, `hasCompletedPlacement`

3. Registration token key consistency

4. Email verification navigation branches

5. Stripe webhook idempotency

6. Paywall cannot be bypassed via `?checkout=success`

  

---

  

## Auth Architecture (Current)

  

```

HTTP Request

↓

RequireActiveSubscriptionGuard (global)

↓

GlobalApiTokenGuard

├── dev: skipped

└── prod: x-api-token (from SPA bundle)

↓

Route Guard (often missing on writes)

↓

Controller Handler

```

  

**Main risks:** missing route-level authorization on writes, self-service privilege escalation, auth endpoints without rate limiting.

  

---

  

## Checklist for Production Hardening

  

- [ ] Strip `role`, `isSuspended`, `hasCompletedPlacement` from user-facing DTOs

- [ ] Add `JwtAdminGuard` (or equivalent) on all mutation routes

- [ ] Remove `VITE_API_TOKEN` from production frontend builds

- [ ] Fix registration token key + email verification navigation

- [ ] Fix vocabulary hints inverted condition

- [ ] Replace paywall query-param bypass with server-verified checkout

- [ ] Fix ProfileSettings hooks order

- [ ] OTP: CSPRNG + rate limits

- [ ] Re-check suspension/verification in `AuthGuard`

- [ ] OAuth `state` parameter

- [ ] Move JWT out of `localStorage` (httpOnly cookies)

- [ ] Stop persisting passwords in sessionStorage

- [ ] Add guard matrix + registration flow tests