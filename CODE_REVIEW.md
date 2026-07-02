# Explys Thermo-Nuclear Code Review

**Project:** eng_curses (backend + frontend + mobile)  
**Date:** 2026-07-02  
**Branch:** `product`  
**Scope:** Full codebase health, security, structural quality, maintainability, tests  
**Verdict:** **BLOCK** for production hardening — merge marketing work only after resolving blockers below

---

## Executive Summary

Explys is a full learning platform (NestJS 11 + Prisma 7, React 19 + Vite, Expo mobile). The May 2025 review flagged authorization and registration bugs. **Several of those are fixed** on `product`: suspension re-check in `AuthGuard`, CSPRNG OTPs, OAuth CSRF state, `ValidationPipe` whitelisting, content-recommendations auth, canonical `/login` and `/register` routes, `ProfileSettings` decomposition, vocabulary-hints logic.

**What still blocks approval:**

1. **Taxonomy and content-stats mutations remain unguarded** — production relies on `x-api-token` extracted from the SPA bundle.
2. **`HeroStats` couples public marketing to admin analytics** and applies a magic `+3259` user offset.
3. **Client paywall bypass** via `/catalog?checkout=success` without server verification.
4. **`hasCompletedPlacement` still writable via profile PATCH** (privilege strip incomplete).
5. **Dead experiment code** — `useABtest.ts` orphaned with `any` casts and no consumers.

**Recommended fix order:**

1. Security guards on all write endpoints; remove API token as sole mutation gate  
2. Public stats endpoint; delete admin fetch and `+3259` from hero  
3. Server-verified checkout; remove query-param paywall bypass  
4. Strip `hasCompletedPlacement` from user-facing DTOs  
5. Delete or wire `useABtest.ts`; consolidate analytics module  
6. Backend tests on PR CI; guard-matrix test suite  

---

## Approval Bar

| Gate | Status |
|------|--------|
| No structural regression in shared paths | ❌ Admin API on public landing |
| No obvious code-judo path ignored | ❌ Public `/public/stats` would delete hero hack |
| No unjustified >1k-line files | ✅ `ProfileSettings` refactored to 23-line shell |
| No spaghetti special-case branching | ❌ Paywall query bypass |
| No hacky abstractions | ❌ `+3259` offset, dead A/B hook |
| Security blockers addressed | ❌ Taxonomy CRUD open |
| Tests cover guard matrix + paywall | ❌ Missing |

---

## 1. Structural Regressions (Blockers)

### S1. Public landing calls admin analytics + magic offset

**Severity:** Blocker  
**Status:** OPEN  
**Files:** `frontend/src/components/landing/HeroStats.tsx`, `frontend/src/lib/adminAnalyticsApi.ts`

On every homepage load, `HeroStats` calls `fetchAdminOverview()` (route guarded by `JwtAdminGuard`). For anonymous visitors the call fails silently; on success it renders `totalUsers + 3259`.

This is feature logic leaking into a shared marketing path, with a non-auditable magic number baked into social proof.

**Code-judo fix:** Add `GET /public/stats` returning `{ activeLearners, videoCount, watchHours }`. Hero reads one endpoint. Delete `+3259`. Remove `adminAnalyticsApi` import from landing entirely.

---

### S2. Dead A/B experiment module

**Severity:** High  
**Status:** OPEN  
**Files:** `frontend/src/hooks/useABtest.ts` (37 lines, **zero imports**)

Orphan hook uses `localStorage` + `Math.random()`, `(window as any).posthog`, Russian comments, and bypasses typed `captureEvent`. `HeroSection` no longer references it — good — but the file remains as dead weight and invites reintroduction without wiring.

**Code-judo fix:** Delete `useABtest.ts` until PostHog feature flags are enabled in `analytics.ts` (`advanced_disable_feature_flags: true` today). When experiments return, one `experiments.ts` module owns variant + capture.

---

### S3. Analytics layered three ways

**Severity:** High  
**Status:** OPEN  
**Files:** `frontend/src/lib/analytics.ts`, `landingAnalytics.ts`, `posthogReachability.ts`

Bootstrap, reachability probe, GA pageviews, and thin landing wrappers coexist. PostHog flags disabled; landing events duplicate patterns.

**Code-judo fix:** `lib/analytics/` with `bootstrap.ts`, `events.ts` (typed event catalog). Delete pass-through wrappers that only rename `captureEvent`.

---

### S4. Locale files at decomposition threshold

**Severity:** Medium  
**Status:** OPEN  
**Files:** `frontend/src/locales/landing/en.ts` (863 lines), `uk.ts` (868 lines)

Every landing edit touches two 800+ line parallel blobs. Testimonials alone added 15 quote objects.

**Code-judo fix:** Split by section (`hero.en.ts`, `testimonials.en.ts`, `pricing.en.ts`) with shared key types and barrel exports.

---

## 2. Security Findings

### Auth stack (current)

```
HTTP Request
    ↓
RequireActiveSubscriptionGuard (production only)
    ↓
GlobalApiTokenGuard
    ├── non-production: skipped entirely
    └── production: x-api-token (VITE_API_TOKEN in SPA bundle)
    ↓
Route Guard (missing on several write controllers)
    ↓
Controller Handler
```

### Critical / high — OPEN

| ID | Finding | Files | Status |
|----|---------|-------|--------|
| SEC-1 | Tags/categories/topics `POST`/`PATCH`/`DELETE` have **no `@UseGuards`** | `tags.controller.ts`, `categories.controller.ts`, `topics.controller.ts` | **OPEN** |
| SEC-2 | `ContentStatsController` fully unguarded CRUD | `content-stats.controller.ts` | **OPEN** |
| SEC-3 | `VITE_API_TOKEN` in bundle is production write gate for taxonomy | `lib/api.ts`, `global-api-token.guard.ts` | **OPEN** |
| SEC-4 | Paywall bypass: `/catalog?checkout=success` | `RequireSubscriberAccess.tsx` | **OPEN** |
| SEC-5 | `hasCompletedPlacement` passes through `updateProfile` | `users.service.ts`, `update-user.dto.ts` | **PARTIAL** (role/suspension stripped) |
| SEC-6 | Unauthenticated Gemini endpoints (cost abuse) | `content-video.controller.ts` | **OPEN** |
| SEC-7 | JWT in `localStorage`; `api.ts` header comment claims httpOnly cookies | `lib/api.ts` | **OPEN** |

### Fixed since May 2025 ✅

| ID | Finding | Status |
|----|---------|--------|
| SEC-F1 | `AuthGuard` re-checks `isSuspended` | **FIXED** |
| SEC-F2 | OTP uses `crypto.randomInt` | **FIXED** |
| SEC-F3 | Core auth endpoints have `@Throttle` | **FIXED** |
| SEC-F4 | OAuth CSRF `state` in session | **FIXED** |
| SEC-F5 | Content recommendations require `AuthGuard` | **FIXED** |
| SEC-F6 | `ValidationPipe` + `forbidNonWhitelisted: true` | **FIXED** |
| SEC-F7 | `ScheduleModule.forRoot()` | **FIXED** |
| SEC-F8 | Contents mutations use `JwtAdminGuard` | **FIXED** |
| SEC-F9 | Registration token key / `apiFetch` on preferences | **FIXED** |
| SEC-F10 | Email verification navigation (single flow) | **FIXED** |
| SEC-F11 | Vocabulary hints inverted guard | **FIXED** (`useLessonWatch.ts`) |
| SEC-F12 | Canonical `/login`, `/register` routes | **FIXED** |
| SEC-F13 | `ProfileSettings` hooks-order / 1531-line monolith | **FIXED** (split into cards) |

### Medium — OPEN

| ID | Finding | Fix |
|----|---------|-----|
| SEC-M1 | `JwtAdminGuard` skips `isSuspended` check | Add suspension to admin guard |
| SEC-M2 | OTP plaintext in DB | Hash at rest |
| SEC-M3 | Email resend endpoints without throttle | Add `@Throttle` |
| SEC-M4 | Stripe webhooks lack `event.id` dedup | Redis idempotency key |
| SEC-M5 | Default 500 MB JSON body limit | Default 10 MB; override per route |
| SEC-M6 | `GlobalApiTokenGuard` uses `!==` not timing-safe compare | `timingSafeEqual` |
| SEC-M7 | Registration passwords in sessionStorage | Exclude from draft persistence |
| SEC-M8 | Commented-out test documents `hasCompletedPlacement: true` allowed | Remove from DTO; uncomment test as regression guard |

---

## 3. Functional Bugs

| ID | Issue | Location | Status |
|----|-------|----------|--------|
| BUG-1 | Hero stats fail for anonymous users; fallback hides failure | `HeroStats.tsx` | **OPEN** |
| BUG-2 | Paywall bypass via query param | `RequireSubscriberAccess.tsx` | **OPEN** |
| BUG-3 | `useABtest.ts` dead code | `hooks/useABtest.ts` | **OPEN** |
| BUG-4 | `sitemap.xml` returns 500 in production | `seo.service.ts` | **OPEN** |
| BUG-5 | Dual token keys on login (`explys_` + `exply_`) | `LoginForm.tsx` | **OPEN** |

---

## 4. Spaghetti & Branching Complexity

| Pattern | Where | Verdict |
|---------|-------|---------|
| Paywall policy scattered | `subscriptionAccess.ts`, `RequireSubscriberAccess.tsx`, backend guard | Extract `SubscriptionAccessPolicy` object |
| Post-verification routing tree | `EmailVerification.tsx` | Use `resolveRegistrationCompletionPath` consistently |
| `(req.session as any).oauth_state` | `auth.controller.ts` | Typed session interface |
| `prisma as any` in services | `users.service.ts` | Typed selects; delete casts |
| Commented test + Russian note in spec | `users.service.spec.ts` | Remove dead commented block; enforce DTO boundary in test |

---

## 5. Testing & CI

| Layer | State |
|-------|--------|
| Test files | **25** total (~10 frontend, ~15 backend) |
| Guard matrix | **Untested** |
| Paywall bypass | **Untested** |
| HeroStats / landing | **Untested** |
| PR CI | Frontend test + build only |
| Backend `test:ci` | Runs on deploy workflow, **not on PR** |
| Type-check | `continue-on-error: true` in CI |

### Priority tests

1. Guard matrix snapshot — route → required auth  
2. `updateProfile` cannot set `hasCompletedPlacement`  
3. `RequireSubscriberAccess` — `?checkout=success` blocked when enforcement on  
4. Stripe webhook idempotency  
5. Public stats endpoint (once added) returns stable shape without auth  

---

## 6. Code-Judo Opportunities (Preserve Behavior, Delete Complexity)

| Current | Reframe |
|---------|---------|
| Admin fetch + fallback + offset in hero | Single public stats endpoint |
| Three analytics files + dead A/B hook | One typed analytics module |
| Runtime strip of privileged fields in service | Separate `ProfileUpdateDto` with explicit allowlist |
| Class-level guards per controller | `@Controller('admin/...')` + class `@UseGuards(JwtAdminGuard)` convention |
| Client + server paywall bypass paths | Server checkout session token; client reads profile only |

---

## 7. Production Hardening Checklist

### Blockers

- [ ] `@UseGuards(JwtAdminGuard)` on tags/categories/topics/content-stats mutations  
- [ ] Public stats endpoint; remove admin fetch and `+3259` from `HeroStats`  
- [ ] Delete or properly wire `useABtest.ts`  
- [ ] Remove `hasCompletedPlacement` from user-facing `UpdateUserDto`  
- [ ] Remove paywall `?checkout=success` bypass  

### High priority

- [ ] Stop relying on `VITE_API_TOKEN` for taxonomy writes  
- [ ] Auth + throttle on Gemini proxy endpoints  
- [ ] Fix `sitemap.xml` 500  
- [ ] Backend tests block PR merges  
- [ ] Split landing locale files by section  

### Medium backlog

- [ ] OTP hash-at-rest; resend throttling; webhook idempotency  
- [ ] httpOnly cookie migration (fix misleading `api.ts` comment)  
- [ ] JwtAdminGuard suspension check  
- [ ] Studying plan v2 bulk migration verification (`STUDYING_PLAN_V2_CUTOVER.md`)  

---

## Document History

| Date | Scope |
|------|-------|
| 2026-05-25 | Initial security-focused review |
| 2026-07-02 | Thermo-nuclear rewrite on `product` branch |
