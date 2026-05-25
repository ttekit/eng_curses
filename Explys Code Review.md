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