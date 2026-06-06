# UX Research Report: explys.com

**Target URL:** https://explys.com  
**Research date:** 3 June 2026  
**Method:** Live site fetch (homepage, pricing, gated routes, robots.txt), industry market data, competitive product review, site instructions ([explys.com.md](file:///Users/ttekit/.cursor/skills/ux-research-pipeline/industries/sites/explys.com.md)).

---

## 1. Desk Research

### Domain & product signals (observed)

- **Positioning:** *"Learn English your way"* — adaptive video lessons matching interests, level, and learning style; chameleon metaphor for personalization.
- **Primary CTAs (homepage):** "Start learning free" and "Browse content."
- **Feature pillars (homepage):** Video-based learning (movies/series/educational clips), AI personalization, post-video quizzes, gamification (XP/achievements), analytics, audiences (students, professionals, teachers).
- **How it works (4 steps):** (01) Create account + role/interests → (02) Placement via catalog → (03) Student learning plan → (04) Video + comprehension quiz.
- **Pricing (`/pricing`):** Light $7/mo, Smart $12/mo (Most popular), Family $19/mo, Teacher LMS custom/enterprise. Copy: *"Sign in to subscribe to Light, Smart, or Family."* Stripe + terms referenced.
- **Technical:** React SPA (thin initial HTML); Cloudflare delivery; `robots.txt` allows `/` and `/pricing`; disallows `/catalog`, `/content/`, `/learning-plan`, registration paths, profile, admin.
- **Gating:** `/catalog` and `/learning-plan` render sign-in ("Welcome back") — not public browse. `/login`, `/register`, `/signup` return **404** at fetch time. `sitemap.xml` returned **500**.

### Market statistics (sourced)

| Metric | Figure | Source |
|--------|--------|--------|
| Digital English language learning market (2026) | ~USD 15.98B | [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/digital-english-language-learning-market) |
| Projected 2031 | ~USD 31.62B (14.62% CAGR) | Same |
| Subscription share of digital ELL (2025) | ~46.6% | Same |
| English share of online language learning | ~55% | [MarkNtel Advisors](https://www.marknteladvisors.com/research-library/online-language-learning-market-report.html) |
| Fastest-growing region | Asia-Pacific | Industry reports (Mordor, Meticulous Research) |

### Forum & social sentiment

- **No indexed third-party reviews** specifically for `explys.com` (brand too new or low crawl volume) — reputation window is open but unvalidated.
- **Adjacent-category sentiment** (ELSA, Duolingo, AI tutor apps): learners praise convenience, gamification, and feedback; common complaints include subscription confusion, onboarding length, and "passive" video without speaking practice.
- **Name collision risk:** Search surfaces **Exprely** (live tutoring) and **Expressify** (idioms app) — not the same product; may dilute brand discovery.

### Industry trends relevant to Explys (2026)

1. **AI personalization** and adaptive paths are table stakes — must be *demonstrated*, not only claimed.
2. **Freemium / no-card free start** drives top-of-funnel in self-paced apps (~15–30% signup completion benchmarks per EdTech playbooks).
3. **Video + active recall** (quizzes during or immediately after clips) aligns with MOOC completion research — Explys copy explicitly promises this loop.
4. **Family + school tiers** expanding ARPU; parental controls and teacher dashboards expected on respective tiers.

---

## 2. Nielsen Heuristics

| # | Heuristic | Rating | Site-specific evidence |
|---|-----------|--------|------------------------|
| 1 | **Visibility of system status** | Mixed | Pricing states Stripe and plan names clearly; authenticated states (placement progress, lesson resume) not visible without login. **Interactive State Uniformity:** Marketing CTAs show hover/focus via consistent purple brand; gated routes (`/catalog`) switch to sign-in without explaining *why* browse is locked — no loading/progress on SPA route changes observable in static fetch. Lesson-player states (pause-for-quiz, timeline markers) not verifiable on public pages. |
| 2 | **Match between system and real world** | Good | Plain-language journey: account → placement → plan → video/quiz mirrors learner mental model; entertainment vocabulary (movies, series) matches Explorer audience. |
| 3 | **User control and freedom** | Mixed | Multi-step onboarding described; unclear if role (learner vs teacher) can be changed without re-registration. Broken `/login` URL reduces user control. |
| 4 | **Consistency and standards** | Good | Repeated CTA labels ("Start learning free", "Browse content"), purple brand (`#813dec` theme), consistent tier naming across homepage pricing section and `/pricing`. |
| 5 | **Error prevention** | Partial | Password rules documented in registration flow (per product copy); public 404 on `/login` is a preventable routing error. |
| 6 | **Recognition rather than recall** | Good | Numbered steps 01–04 in "How Explys works"; chip-based interests/goals vs free-text-only (per onboarding design). |
| 7 | **Flexibility and efficiency of use** | Good | Role paths (student, adult, teacher) and four pricing tiers; Smart marked "Most popular" as default anchor. |
| 8 | **Aesthetic and minimalist design** | Good | Scannable landing sections: hero, features, how-it-works, pricing preview, final CTA; no wall-of-text pricing. |
| 9 | **Help users recognize, diagnose, recover from errors** | Weak | No public FAQ, help center, or status page; 404 on common auth URLs offers only "Return to main page." |
| 10 | **Help and documentation** | Weak | Teacher tier uses "Talk to us" for B2B; no learner help/docs link in fetched public shell. |

**Heuristic #1 — Interactive State Uniformity (expanded):** Primary buttons use consistent rounded purple styling across hero and pricing. Secondary "Browse content" appears in hero and footer CTA block — same label, same intent. **Gap:** Sign-in form states (invalid password, network error) not observable without auth. **Gap:** No visible disabled/loading state on pricing "Select Light" when logged out — user must discover "Sign in to subscribe" line above cards.

---

## 3. Usability Audit

### Informational Hierarchy

| Zone | High-intent data present? | Assessment |
|------|---------------------------|------------|
| Hero | Value prop + dual CTAs | Strong emotional hook; **price and time-to-first-lesson absent** above fold |
| Features | Six benefit tiles | Good scan; AI and quiz benefits mid-page |
| How it works | 4-step process | **Placement and plan** visible before pricing — good for Fast Buyer if read |
| Pricing (homepage + `/pricing`) | $7 / $12 / $19 + feature bullets | Transactional data **below fold** on homepage; full detail on `/pricing` |
| Footer CTA | "No credit card required. Start learning in under 2 minutes." | Strong transactional reassurance — **should be nearer hero** |

**Finding:** Explorer content (movies/series, chameleon story) wins above fold; **decision data** (free tier scope, first-lesson path, subscribe gate) requires scroll or separate pricing visit.

### De-duplication of Navigation

| Element | Occurrences (observed) | Recommendation |
|---------|------------------------|----------------|
| "Start learning free" / "Get started" | Hero, header nav, footer CTA | Acceptable repetition for conversion — ensure single registration entry URL |
| "Browse content" | Hero secondary CTA + footer | **Misleading** — both route to login-gated catalog; duplicate promise of open browse |
| "Pricing" | Nav + homepage section + `/pricing` | Expected; keep |
| "Log in" | Nav + sign-in page on `/catalog` | Consolidate login to one working route (`/login` currently 404) |
| "How it works" | Section anchor + footer link | Acceptable |

**Count:** 2× "Browse content" CTAs create **duplicate false affordance** before authentication.

### UX laws (additional)

| Law | Application | Evidence |
|-----|-------------|----------|
| **Hick's Law** | 4 pricing tiers × 3 learner roles × hobby/genre matrices at signup | Smart "Most popular" mitigates tier choice; role picker still adds delay |
| **Fitts's Law** | Primary CTAs in hero and sticky header | Likely adequate on desktop; verify mobile menu reach |
| **Jakob's Law** | Video catalog + quiz pattern familiar from YouTube + Duolingo | Low learning curve for lesson loop |
| **Peak–End Rule** | Quiz after video + summary page (product architecture) | Strong end peak if feedback immediate |
| **Miller's Law** | 4 onboarding steps — within 7±2 chunk | Good |
| **Tesler's Law** | Placement complexity unavoidable — must show progress stepper | Placement described but no duration ("~5 min") on homepage |

### Accessibility flags

- Viewport `maximum-scale=1.0, user-scalable=0` (observed in prior HTML shell audit) — **blocks pinch-zoom** (WCAG 2.2 concern).
- SPA: minimal structure on first paint for crawlers and no-JS users.
- `sitemap.xml` 500 — SEO/discoverability risk.

---

## 4. Competitive Analysis

### Three direct competitors

| Dimension | **Explys** | **Duolingo** | **Babbel** | **ELSA Speak** |
|-----------|------------|--------------|------------|----------------|
| **Core modality** | Long-form video + subtitles + quizzes | Bite-size gamified drills | Structured lesson courses | AI speaking + role-play |
| **Content** | Movies, series, educational video | Synthetic + stories | Dialog-based curriculum | Speech scenarios + media learners |
| **Personalization** | Interests, level, learning plan | Adaptive path, streaks | Goal-based courses | Accent, industry, CEFR |
| **Free start** | "Start learning free" (no card stated) | Freemium core | Limited free trial | Free tier + upgrade |
| **Pricing (individual)** | $7 / $12 / $19 mo | Super Duolingo ~$7–13 mo | ~$7–14 mo | Freemium + Pro |
| **Gamification** | XP, achievements, leaderboards (Smart+) | Streaks, leagues | Streaks | Scores, dashboards |
| **B2B / schools** | Teacher LMS (40 students/class) | Duolingo for Schools | Babbel for Business | ELSA Schools / Business |
| **Social proof** | "Join thousands of learners" (unverified) | 500M+ users cited industry-wide | Millions of subscribers | 92M+ downloads, 4.9★ |
| **Differentiator** | Entertainment-first adaptive video catalog | Habit + gamification scale | Credible structured courses | #1 speaking/pronunciation |

**Strategic whitespace:** Explys is the only competitor in this set leading with **interest-based long-form video** tied to comprehension quizzes. **Risk:** ELSA/Duolingo own "AI English" and speaking-confidence mindshare; Explys must show **sample clip or quiz demo** pre-signup to avoid "passive Netflix" perception.

---

## 5. Google Analytics

*Simulated KPI framework — replace with live GA4 when available.*

### Assumed traffic profile (first 90 days)

| Metric | Estimated range | Rationale |
|--------|-----------------|-----------|
| Monthly sessions | 8,000 – 25,000 | New brand, EN/UA SEO, limited backlinks |
| Traffic mix | 45% Direct, 30% Organic, 15% Social, 10% Referral | Launch marketing + word of mouth |
| Mobile share | 62 – 68% | Language learning skews mobile |
| Landing bounce | 48 – 58% | Typical EdTech marketing |
| Avg. session duration | 2:40 – 4:10 | Scroll + partial signup |

### Funnel (illustrative monthly)

```
Landing (10,000)
  → Registration start (1,200)     12%
  → Registration complete (720)      60%
  → Placement complete (540)         75%
  → First video completed (380)      70%
  → First quiz completed (290)       76%
  → Paid (Light/Smart) (35–45)       8–12% of activated
```

### Events to instrument

| Event | Purpose |
|-------|---------|
| `cta_click` (hero, pricing, browse) | Section attribution |
| `registration_step_completed` | Drop-off by step |
| `placement_started` / `completed` | Activation |
| `video_started` / `completed` / `quiz_pause` | Lesson loop |
| `pricing_tier_click` | Monetization intent |
| `login_404` / `auth_error` | Broken route detection |

---

## 6. Research Hypotheses

1. **H1 — Browse bait-and-switch:** Users clicking "Browse content" expect a public catalog preview; login gate increases bounce unless a trailer clip is shown first.

2. **H2 — Placement surprise:** Learners who skip "How it works" hit placement inside catalog without expecting a questionnaire — activation drop.

3. **H3 — Tier opacity:** Visitors cannot distinguish Light vs Smart without reading bullet lists; no screenshot of AI error analysis or analytics dashboard.

4. **H4 — Auth URL breakage:** `/login` 404 erodes trust for returning users from email or bookmarks.

5. **H5 — Teacher path collision:** Households pick wrong role at signup (student vs teacher), causing irreversible wrong dashboard.

---

## 7. Interviews Testing Plan

### Objective
Validate onboarding clarity, browse expectations, and tier comprehension.

### Participants (n = 6)

| Segment | n | Profile |
|---------|---|---------|
| University student | 2 | B1–B2, mobile-first, uses Duolingo |
| Working professional | 2 | 25–40, career English, 15 min/day |
| Teacher / tutor | 2 | Exploring LMS for ≤40 students |

### Session flow (45 min)

| Block | Duration | Activity |
|-------|----------|----------|
| Warm-up | 5 min | Current English tools, goals |
| Task 1 | 10 min | Cold open homepage — state value in own words |
| Task 2 | 15 min | Think-aloud: register, reach first video |
| Task 3 | 10 min | Complete one lesson + quiz |
| Debrief | 5 min | Pricing comprehension, NPS intent |

### Card-sorting protocol
- **Open sort:** 20 feature labels (video, placement, XP, AI analysis, family profiles, gradebook) into "Must have before pay" / "Nice later" / "Don't care."
- **Validation:** Compare sorts to current pricing tier bullets.

---

## 8. Survey Plan

### Screening
- Age 16+, learning English, uses app or video content ≥1×/week.

### Likert blocks (1–5)
- "I understood what happens after I click Start learning free."
- "Browse content matched my expectation."
- "I know which plan I would choose."
- "Placement felt appropriately short."
- "Quizzes felt connected to the video."

### Open text
- "What almost stopped you from signing up?"
- "What would you tell a friend Explys does?"

### Optional card-sort validation
- Show tier feature list — ask which tier fits persona (student / professional / parent).

**Target n:** 120 responses (MoE ~9% at 95% confidence).

---

## 9. Insights Mapping

| Cluster | Findings | Impact | Action |
|---------|----------|--------|--------|
| **Discovery friction** | Browse content → login; `/login` 404 | High | Public preview reel + fix auth routes |
| **Hierarchy** | Price/time-to-lesson below fold | Medium | Hero subline: free start + ~2 min to account |
| **Trust** | Unverified "thousands of learners"; no reviews | Medium | Add metric source or testimonial strip |
| **Tier clarity** | AI/analytics abstract on Smart | Medium | Screenshot/demo of error analysis |
| **Onboarding** | Placement inside catalog surprises users | High | Stepper + duration on placement |
| **B2B path** | Teacher tier present; "Talk to us" only | Medium | Dedicated teacher landing + demo CTA |
| **SEO/tech** | sitemap 500; robots block catalog | Medium | Fix sitemap; allow marketing preview URLs |

---

## 10. Persona & JTBD

**Persona A (Fast Buyer):** Oksana, 29, Kyiv-based QA engineer. Wants B2 English for remote job interviews. Opens site on phone during commute. Needs **$12 Smart tier benefits**, **time to first lesson**, and **no credit card** in under 2 minutes. Abandons if "Browse content" loops to login or placement feels endless.

**Persona B (Explorer):** Marco, 22, university student bored by textbook apps. Wants **movies/series-based** learning and fun XP. Needs emotional proof (sample genre clip, chameleon story) **before** pricing. Abandons if site feels like generic "learn English" without taste.

**JTBD:** "When I need English for my life and career, I want lessons that match what I actually enjoy watching, so I can improve without feeling like I'm back in a classroom."

---

## 11. HMW & Crazy 8

### How Might We (from top pain points)

1. **HMW** let explorers taste the catalog before creating an account?
2. **HMW** make placement feel like part of the fun, not a test?
3. **HMW** show Smart-tier AI value in 10 seconds on the pricing page?

### Crazy 8 — HMW #1 (public catalog preview)

1. 60-second featured clip on homepage with one sample quiz question.
2. "Browse as guest" — 3 locked episodes visible, 1 playable.
3. Auto-play muted trailer in hero background.
4. Genre tiles (Sci-fi, Business, Travel) opening preview modals.
5. TikTok-style vertical preview strip on mobile.
6. Embed YouTube-style progress bar with quiz marker dots (preview of product).
7. "Try placement question" micro-widget on landing.
8. Shareable public lesson link for referrals.

---

## 12. Prioritization Mapping

| Initiative | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Fix `/login` + auth route consistency | High | Low | **P0** |
| Public catalog preview (1 clip + quiz) | High | Medium | **P0** |
| Hero transactional subline (free, 2 min, no card) | Medium | Low | **P0** |
| Placement stepper + time estimate | High | Medium | **P1** |
| Smart tier demo screenshot/video | Medium | Low | **P1** |
| Fix sitemap + SEO shell | Medium | Low | **P1** |
| Teacher landing + demo CTA | Medium | Medium | **P1** |
| FAQ / help center link in nav | Medium | Medium | **P2** |
| Social proof with sourced metrics | Medium | Low | **P2** |
| Pinch-zoom accessibility fix | Medium | Low | **P2** |

---

## 13. Customer Journey Map

| Stage | Actions | Touchpoints | Pain | Opportunity | Emotional / Transactional note |
|-------|---------|-------------|------|-------------|-------------------------------|
| **Awareness** | Search, social, referral | Homepage hero | Brand confusion with Exprely/Expressify | Clear subtitle: "video English, not tutoring" | **Emotional** — chameleon/adaptation story works |
| **Consideration** | Read features, pricing | Homepage, `/pricing` | AI value abstract | Demo clip + analytics screenshot | **Emotional** features first OK; add **transactional** price anchor earlier |
| **Conversion** | Sign up, pick role | Registration flow | Multi-step fatigue | Stepper + save progress | **Transactional** — role picker high stakes |
| **Activation** | Placement, open catalog | Catalog, placement test | Unexpected gate after "Browse" | Preview copy: "Sign in to save progress" | **Imbalance** — Explorer promise breaks here |
| **Engagement** | Watch video, in-video quiz | Lesson player | Quiz fatigue on long clips | Pause-for-question + timeline markers | **Balanced** — active recall during clip |
| **Retention** | Learning plan, streaks | Profile, plan page | Plan invisible pre-signup | Show roadmap teaser in onboarding | **Emotional** goal visibility |
| **Monetization** | Upgrade Light → Smart | `/pricing`, subscribe | "Sign in to subscribe" friction | Inline upgrade after first quiz success | **Transactional** — gate after value delivered OK |
| **Advocacy** | Share progress | Social, referrals | No public lesson links | Shareable quiz score card | **Emotional** peak if gamified |

**Emotional vs transactional balance:** Marketing earns **Explorer** engagement in hero/features, but **Browse content** and **catalog login wall** shift to transactional friction **before** emotional payoff — primary journey imbalance.

---

## 14. Information Architecture

### Observed nav (public)

```
explys.com
├── Home (/)
├── Pricing (/pricing)
├── Catalog (/catalog) → Sign in gate
├── Log in → 404 at /login
├── Get started → registration flow
└── Footer: Catalog, How it works, Pricing, legal
```

### Recommended sitemap

```
explys.com
├── Home
├── How it works (anchor or /how-it-works)
├── Preview (/preview) — 1 public lesson + sample quiz  [NEW]
├── Pricing
├── For teachers (/teachers) — LMS features + Talk to us  [NEW]
├── Help / FAQ  [NEW]
├── Log in (/login) — fixed route
├── Sign up (/signup)
└── App (authenticated)
    ├── Catalog
    ├── Learning plan
    ├── Lesson (/content/:id)
    ├── Profile
    └── Subscribe
```

### Scalable modular blocks

| Block | Use |
|-------|-----|
| **Hero + dual CTA** | Home, campaign landing |
| **Sample lesson embed** | Home, Preview, Paid social |
| **4-step how-it-works** | Home, onboarding emails |
| **Pricing tier grid** | Home (summary), Pricing (full) |
| **Social proof strip** | Home, Pricing — sourced metrics only |
| **Teacher B2B band** | Teachers page, Pricing footer |
| **FAQ accordion** | Help, Pricing objections |
| **Sticky mobile CTA** | Home scroll — "Start free" |

---

## 15. Rapid Testing Params

### Five-second test

**Stimulus:** Homepage hero (desktop + mobile).  
**Question:** "What does this product do?"  
**Pass criteria:** ≥70% mention video English learning; ≥40% mention personalization/adaptive.

### Hallway test (n = 5)

**Task:** "Find how much the most popular plan costs and start free."  
**Pass criteria:** Complete in ≤90s without assistance; 0× hit 404 on login.

### First-click test

**Scenario:** "You want to watch a lesson about movies before signing up."  
**Pass criteria:** ≥60% click Browse or Preview; document failure paths.

---

## 16. Design Handoff

### Design
- [ ] Public preview lesson module (video + 1 quiz)
- [ ] Auth route map — single login URL
- [ ] Placement stepper component spec
- [ ] Pricing tier comparison with Smart demo visual
- [ ] Teacher `/teachers` page wireframe
- [ ] Timeline quiz markers on player scrubber (in-app)
- [ ] In-video question panel — right rail, 80% opacity (in-app)

### Engineering
- [ ] Fix `/login`, `/signup` routing (404)
- [ ] Repair `sitemap.xml` (500)
- [ ] Guest preview endpoint or static marketing clip
- [ ] GA4 events per §5
- [ ] Remove viewport zoom lock
- [ ] Consistent post-logout redirect to working login

### Stakeholder
- [ ] Align "Browse content" copy with actual gate behavior
- [ ] Approve sourced social proof or remove unsourced claims
- [ ] Teacher sales path owner for "Talk to us"

### Release acceptance criteria
- [ ] 0 critical 404s on nav links
- [ ] Five-second test pass rate ≥70%
- [ ] Placement completion ≥60% in beta cohort
- [ ] First-lesson-with-quiz completion ≥50% of placed users

---

## 17. Industry Playbook

**Classification:** [EdTech / Language learning](file:///Users/ttekit/.cursor/skills/ux-research-pipeline/industries/edtech-language-learning.md) (primary) | [B2B SaaS](file:///Users/ttekit/.cursor/skills/ux-research-pipeline/industries/b2b-saas.md) (secondary — Teacher LMS) | **Confidence:** High — video catalog, placement, learning plan, tiered subscriptions, Teacher enterprise tier on `/pricing`.

| Tactic | Do this | Typical uplift | Source | Site status | Evidence on explys.com |
|--------|---------|----------------|--------|-------------|------------------------|
| EDU-01 Frictionless free start | "Start free" above fold; no credit card; time-to-account <2 min stated | ~15–30% signup completion | PLG / EdTech onboarding benchmarks | **Partial** | Hero "Start learning free"; footer "No credit card required. Start learning in under 2 minutes" — but reassurance below fold; `/login` 404 hurts return visits |
| EDU-02 Placement / level clarity | Explain placement on homepage + step 2; show duration | ~10–20% activation after signup | Duolingo/Babbel-style onboarding research | **Partial** | Step 02 in "How it works" describes placement; no duration estimate; catalog gate surprises "Browse" users |
| EDU-03 Learning plan visibility | Show roadmap/phases before paywall | ~8–15% week-1 retention | Learning science — goal visibility | **Partial** | Step 03 describes student plan + profile re-entry; plan not visible pre-signup |
| EDU-04 Scannable pricing tiers | Individual / family / teacher rows; "most popular" highlight | ~5–12% paid conversion | Baymard-style plan comparison (adapted subscriptions) | **Met** | `/pricing`: Light $7, Smart $12 (Most popular), Family $19, Teacher custom; feature bullets per tier |
| EDU-05 Lesson loop on one screen | Video + subtitles + quiz while clip is fresh | ~10–18% lesson completion | MOOC/video-course UX studies | **Partial** | Copy promises quiz after video; in-video pause-for-question in product — not demonstrable on marketing site |
| EDU-06 Gamification preview | Show XP/achievements on marketing or post-signup | ~5–10% DAU | Gamified learning engagement literature | **Partial** | Features tile "Gamified progress"; locked to Smart tier bullets — no screenshot |
| EDU-07 Progress analytics promise | Clear "what you'll see" tied to mid tier | ~4–8% upgrade to mid tier | Subscription upsell patterns | **Gap** | Smart lists "Deep progress analytics" — no sample dashboard on `/pricing` |
| EDU-08 Content taste proof | Sample genres on homepage; browse path | ~5–12% Explorer conversion | Content-based EdTech marketing tests | **Partial** | Features cite movies/series; "Browse content" CTA exists but **catalog requires sign-in** — no public preview |
| EDU-09 Role split (learner vs teacher) | Signup role picker + Teacher pricing with sales CTA | ~10–20% B2B pipeline quality | B2B EdTech funnel benchmarks | **Partial** | Step 01 role picker in copy; Teacher LMS tier + "Talk to us" on pricing — no dedicated teacher page |
| EDU-12 Trust at payment | Stripe/trust copy, terms near plan buttons | ~3–6% checkout completion | Subscription trust patterns | **Met** | `/pricing`: "Payments are processed securely by Stripe" + terms line |
| SaaS-02 Demo vs trial split | "Book demo" vs "Start trial" for different ICPs | ~8–15% lead quality | Gartner / PLG benchmarks | **Partial** | Learner self-serve tiers vs Teacher "Talk to us" — no explicit "Book demo" button |
| SaaS-06 Feature comparison table | Side-by-side tiers with checkmarks | ~5–12% paid conversion | Baymard-style comparison (adapted B2B) | **Partial** | Stacked cards with bullets — no matrix comparing Light/Smart/Family |
| EDU-10 Family plan economics | Profiles, parental controls visible on Family tier | ~3–8% ARPU (family attach) | Consumer subscription family plans | **Met** | Family tier lists 3 profiles, parental controls, tournaments |
| EDU-11 Mobile lesson ergonomics | Thumb-friendly player, subtitle controls, resume | ~8–15% mobile completion | Mobile learning UX composite | **Gap** | Not verifiable on public site; marketing SPA mobile UX unknown |

**Top 3 playbook-backed P0 actions**

1. **EDU-08 + EDU-01 — Public preview + honest browse:** Replace login-only "Browse content" with guest preview (one clip + quiz) and fix auth URLs — cross-link §12 P0.
2. **EDU-02 — Placement clarity:** Add placement duration + stepper before catalog questionnaire — reduces activation surprise (§12 P0 placement stepper).
3. **EDU-07 + EDU-04 — Smart tier proof:** Add analytics/error-analysis screenshot on `/pricing` next to $12 Smart — closes AI opacity gap (§12 P1).

---

*Sources:* https://explys.com/, https://explys.com/pricing, https://explys.com/catalog, https://explys.com/robots.txt, https://www.elsaspeak.com/, https://www.mordorintelligence.com/industry-reports/digital-english-language-learning-market, https://www.marknteladvisors.com/research-library/online-language-learning-market-report.html — fetched 3 June 2026.
