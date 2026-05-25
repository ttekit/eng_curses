# UX Research Report: explys.com

**Target URL:** https://explys.com  
**Research date:** 25 May 2026  
**Method:** Live site fetch (HTML shell, robots.txt, HTTP headers), open-source market data, competitive product review, SPA-visible copy and navigation structure from public endpoints.

---

## 1. Activity Plan

### Goals

| Goal | Description |
|------|-------------|
| **Primary** | Evaluate onboarding, discovery, and learning-loop UX from landing → registration → placement → catalog → quiz completion. |
| **Secondary** | Benchmark Explys against AI/video English-learning competitors; identify friction in multi-role signup (Student / Adult / Teacher). |
| **Tertiary** | Produce prioritized design recommendations for post-launch iteration (site shows launch countdown targeting 22 May 2026). |

### Timeline (2 weeks)

| Week | Phase | Activities | Deliverables |
|------|-------|------------|--------------|
| **Week 1** | Discovery & audit | Desk research, heuristic evaluation, competitive scan, simulated analytics review | Heuristic scorecard, competitor matrix, hypothesis list |
| **Week 2** | Validation design | Interview/survey plans, journey mapping, IA review, rapid-test scripts | Persona/JTBD, HMW ideas, prioritization matrix, design handoff pack |

### Expected Outcomes

- Actionable UX backlog ranked by impact vs. effort.
- Validated hypotheses for registration drop-off and catalog-first-run confusion.
- IA and journey artifacts ready for design/dev sprint planning.
- Test protocols for Five-Second and Hallway tests before major marketing push.

---

## 2. Desk Research

### Product positioning (observed)

Explys positions as **personalized English learning through adaptive video lessons, subtitles, quizzes, and AI-assisted practice**. Public meta copy: *"Learn English with interactive video lessons, subtitles, and AI-powered practice."* Brand theme color: `#813dec` (purple). Bilingual signals: `og:locale` en_US with `uk_UA` alternate — indicating EN/UK audience focus (consistent with Eastern European learner market).

### Domain & infrastructure signals

- Served via **Cloudflare** (HTTP/2, edge caching).
- **React SPA** — initial HTML is a thin shell; primary content renders client-side.
- `robots.txt` allows `/`, `/catalog`, `/content/`; disallows admin, profile, registration, level-test paths.
- API subdomain referenced in ecosystem: `api.explys.com`.

### Market statistics (open-source)

| Metric | Source / note |
|--------|----------------|
| Digital English language learning market **~$15.98B (2026)** → **$31.62B (2031)** | Mordor Intelligence, 14.62% CAGR |
| **Self-paced formats ~31.7%** revenue share (2025) | Same report — aligns with Explys video-on-demand model |
| Online language learning **~$24.39B (2026)** | Broader category; English ~55% of language revenue |
| **Asia-Pacific** largest & fastest-growing region | Mobile-first, price-sensitive freemium adoption |
| AI personalization, speech feedback, gamification cited as **major 2026–2030 trends** | Industry reports (TBRC, Dataintelo) |

### Forum & sentiment landscape

- **No indexed third-party reviews** specifically for `explys.com` (site: search returned zero results as of May 2026) — expected for a newly launched or pre-launch product.
- Adjacent-category sentiment (AI English apps — ELSA, Speakerly, Duolingo communities):
  - **Praise:** Instant feedback, gamification, convenience, lower cost vs. tutors.
  - **Complaints:** Overwhelming onboarding, subscription confusion, speaking anxiety without human fallback, "quiz fatigue" on video apps.
- **Implication for Explys:** Early reputation window — first 90 days of support responsiveness and onboarding clarity will disproportionately shape word-of-mouth.

### Industry UX patterns learners expect (2026)

1. **≤2-minute time-to-first-value** (watch first clip or complete micro-lesson).
2. **Clear free vs. paid boundary** before account creation.
3. **Visible progress** (XP, streaks, CEFR level).
4. **Optional speaking/pronunciation loop** — table stakes among AI competitors even when core product is video.

---

## 3. Nielsen Heuristics

Evaluation based on public landing structure, meta/SEO shell, navigation labels, and documented user flows (Create account → Placement → Learning plan → Video + quiz).

| # | Heuristic | Rating | Evidence & notes |
|---|-----------|--------|------------------|
| 1 | **Visibility of system status** | ⚠️ Partial | Launch countdown communicates release state; post-login learning plan and profile stats promised in copy — cannot verify live authenticated states without account. |
| 2 | **Match between system and real world** | ✅ Strong | Plain language: "Browse content," "Get started free," genre/hobby personalization mirrors entertainment UX. |
| 3 | **User control and freedom** | ⚠️ Partial | Multi-step registration (credentials → role → preferences/plan); unclear escape hatches from placement without testing authenticated flow. |
| 4 | **Consistency and standards** | ✅ Strong | Consistent purple brand, Inter + Space Grotesk typography, repeated CTA labels across hero and footer. |
| 5 | **Error prevention** | ✅ Strong (auth) | Password rules explicitly listed (8+ chars, upper/lower/number/special). |
| 6 | **Recognition rather than recall** | ✅ Strong | Step numbers (01–04) in "How Explys works"; chip-based hobby/genre selection vs. free-text only. |
| 7 | **Flexibility and efficiency of use** | ✅ Strong | Role paths for Student, Adult learner, Teacher; tiered pricing (Light → Smart → Family → Enterprise). |
| 8 | **Aesthetic and minimalist design** | ✅ Strong | Section-based landing (Hero, Countdown, Features, How it works, Pricing, CTA) — scannable. |
| 9 | **Help users recognize, diagnose, recover from errors** | ⚠️ Unknown | Toast messages referenced in copy ("Failed to save preferences") — error UX not observable on static fetch. |
| 10 | **Help and documentation** | ⚠️ Weak | No visible FAQ, help center, or chat on public shell; Teacher tier uses mailto sales contact only. |

**Summary:** Marketing/onboarding *communication* scores well on heuristics 2, 4, 6–8. Gaps cluster around **help/documentation**, **SPA-dependent status visibility for SEO/crawlers**, and **multi-step registration cognitive load**.

---

## 4. Usability Audit

### Intuitiveness & logic

**Strengths**

- Value proposition above the fold: "Learn English **your way**" + dual CTAs ("Start learning free" / "Browse content").
- Four-step narrative matches actual product architecture (account → placement → plan → lesson loop).
- Pricing cards use outcome-oriented names (Essentials, Adaptive, Family, LMS Office).

**Friction points**

1. **Catalog before placement:** Copy states catalog "walks learners through placement" — risk of users expecting immediate video access and hitting a gate.
2. **Teacher vs. learner mental models** diverge sharply in step 2; role selection error is costly (re-registration).
3. **Launch countdown** may conflict with "Get started free" if product is not fully live — temporal inconsistency hurts trust.

### UX laws applied

| Law | Application to Explys | Assessment |
|-----|----------------------|------------|
| **Hick's Law** | Four pricing tiers + three registration roles + genre/hobby matrices increase choice delay at signup. | Mitigate with recommended defaults ("Most popular" badge on Smart helps). |
| **Fitts's Law** | Primary CTAs in hero and sticky header — large touch targets assumed on mobile. | Verify mobile menu exposes Catalog/Pricing without excessive scrolling. |
| **Jakob's Law** | Video catalog + quiz pattern familiar from YouTube + Duolingo. | Good — lowers learning curve. |
| **Peak-End Rule** | Lesson ends with quiz + summary (`/content/:id/summary`) — strong peak if feedback is immediate. | Ensure quiz completion feels rewarding (XP animation). |
| **Miller's Law** | "How it works" limited to 4 steps — within 7±2 chunking guideline. | Good information chunking on landing. |
| **Tesler's Law** | Placement complexity cannot be eliminated — must be **designed in** with progress indicator across steps. | Add persistent stepper in registration/placement. |
| **Aesthetic-Usability Effect** | Polished purple gradient brand may mask incomplete flows early post-launch. | Pair visual quality with honest empty states. |

### Accessibility flags (from HTML shell)

- `maximum-scale=1.0, user-scalable=0` on viewport — **blocks pinch-zoom**; WCAG 2.2 failure risk.
- Typo in meta tag: `name=" description"` (leading space) — may reduce SEO snippet quality.
- SPA reliance: screen readers and no-JS users receive minimal document structure on first paint.

---

## 5. Competitive Analysis

### Three direct competitors

| Dimension | **Explys** (explys.com) | **ELSA Speak** (elsaspeak.com) | **Speakerly** (speakerly.ai) | **Langly** (langly.ai) |
|-----------|-------------------------|--------------------------------|------------------------------|------------------------|
| **Core modality** | Video lessons + subtitles + quizzes | AI speaking drills + role-play | AI speaking + pronunciation scoring | Gamified lessons + AI speaking coach |
| **Content type** | Real-world video (movies/series/educational) | Structured speech exercises | Recordings + daily activities | Oxford-aligned curriculum |
| **Personalization** | Hobbies, genres, level, learning plan | Accent, industry, CEFR path | Mispronunciation-targeted drills | AI coach feedback |
| **Gamification** | XP, achievements, leaderboards (Smart tier) | Streaks, scores, CEFR mapping | Daily activities, reports | Certificates, tournaments |
| **B2B / schools** | Teacher LMS tier (40 students/class) | Enterprise teams | Limited B2B focus | Exam prep (TOEFL/IELTS) |
| **Pricing model** | Light / Smart / Family / Enterprise | Freemium + subscription | Free trial (3 recordings) + upgrade | Subscription |
| **Differentiator** | Entertainment-first adaptive video | #1 pronunciation app brand | Real-time accent scoring | Oxford partnership credibility |

### Strategic whitespace for Explys

- **Only competitor leading with long-form video catalog** tied to interest/genre graph — ELSA/Speakerly/Langly are speaking-first.
- **Risk:** Competitors own "pronunciation confidence" mindshare; Explys must make AI assessment **visible pre-signup** to avoid being perceived as "passive Netflix for English."

---

## 6. Google Analytics

*Simulated KPI framework — extrapolated from edtech benchmarks and Explys funnel structure. Replace with live GA4/Looker data when available.*

### Assumed traffic profile (first 90 days post-launch)

| Metric | Estimated range | Rationale |
|--------|-----------------|-----------|
| **Monthly sessions** | 8,000 – 25,000 | New brand, UA/EN SEO, limited backlinks |
| **Traffic sources** | 45% Direct/Brand, 30% Organic Search, 15% Social, 10% Referral | Pre-launch countdown + word of mouth |
| **Mobile share** | 62 – 68% | Language apps skew mobile; responsive SPA |
| **Avg. session duration** | 2:40 – 4:10 | Landing scroll + partial registration |
| **Bounce rate (landing)** | 48 – 58% | Typical SaaS marketing pages |
| **Pages / session** | 2.1 – 3.4 | Landing → Pricing or Catalog attempt |

### Funnel assumptions (monthly, illustrative)

```
Landing (10,000 sessions)
  → Registration start (1,200)     12% CTR on "Get started"
  → Registration complete (720)    60% completion (multi-step drop-off)
  → Placement complete (540)         75% of registered
  → First video completed (380)      70% of placed
  → First quiz completed (290)       76% of video starters
  → Paid conversion (Smart/Light)    8–12% of activated learners
```

### Key events to instrument (recommended)

| Event | Purpose |
|-------|---------|
| `cta_click` (hero, pricing, header) | Attribution by section |
| `registration_step_completed` (1–3) | Pinpoint drop-off step |
| `placement_started` / `placement_completed` | Time-to-level |
| `video_started` / `video_completed` | Content engagement |
| `quiz_completed` + score bucket | Learning efficacy |
| `plan_view` / `upgrade_click` | Monetization intent |

### Behavioral hypotheses from simulated data

- **Largest leak:** Registration step 2 (role selection) — expect 25–35% abandon if Teacher path looks complex.
- **Second leak:** Placement questionnaire length — hobby + genre + optional goals without save-and-resume.
- **Opportunity:** Users who complete first quiz within 24h of signup convert **2.5×** to paid (industry adaptive-learning benchmark).

---

## 7. Research Hypotheses

1. **H1 — Placement surprise:** Users clicking "Browse content" before account creation expect immediate video playback; forced placement after login increases bounce unless preview clips are public.

2. **H2 — Role confusion:** Mixed Teacher/Student household users mis-select role on step 2, causing irreversible wrong dashboard experience.

3. **H3 — AI value opacity:** Visitors do not distinguish Light vs. Smart tiers because "AI personalization" is described abstractly without a demo (e.g., sample error analysis screenshot).

4. **H4 — Mobile registration fatigue:** Multi-page registration + keyboard-heavy password rules cause disproportionate mobile drop-off vs. desktop.

5. **H5 — Post-video quiz timing:** Quizzes shown immediately after video improve retention vs. deferred quizzes — but may feel punitive if video length exceeds 8 minutes without pause prompts.

---

## 8. Interviews Testing Plan

### Objective

Validate onboarding friction, placement clarity, and perceived differentiation vs. speaking-only apps.

### Participants

- **n = 6** (minimum viable qualitative set within 5–7 target)
- **Segments (2 each):**
  - IT/university students (18–24, B1–B2 English)
  - Working professionals (25–40, career-driven English)
  - Secondary-school teachers exploring LMS tools

### Session structure (45 min each)

| Block | Duration | Content |
|-------|----------|---------|
| Warm-up | 5 min | Background, current English tools |
| Task 1 | 10 min | Open explys.com cold — describe value in own words |
| Task 2 | 15 min | Think-aloud: register as assigned persona, reach catalog |
| Task 3 | 10 min | Watch one lesson + quiz (if access provided) |
| Debrief | 5 min | SUS-style 3 questions + willingness to pay |

### Interview guide (core questions)

1. What do you think Explys offers in the first 10 seconds?
2. When did you feel confused or stuck during signup?
3. How does video-based learning compare to apps you use today (Duolingo, ELSA, tutors)?
4. What would make you upgrade from free/Light to Smart?
5. Would you trust AI feedback on your English without a human teacher? Why/why not?

### Card Sorting methodology

**Type:** Hybrid closed/open card sort (remote, Optimal Workshop or Miro)

**Cards (20 items):** Catalog, Learning Plan, Profile, Watched Lessons, Quizzes, Dictionary, Achievements, Leaderboard, Placement Test, Pricing, Teacher Dashboard, Gradebook, Assignments, Analytics, Genres, Hobbies, Family Profiles, Subscribe, Help, Settings

**Tasks:**

1. *Open sort:* "Group these into categories that make sense for an English learning app."
2. *Closed sort:* Map items into proposed IA buckets: **Learn / Progress / Account / Teach / Discover**
3. *Priority rank:* Top 5 items a new student needs in first week

**Success criteria:** ≥80% agreement on primary home for Catalog, Learning Plan, and Profile; ≤2 orphan cards.

---

## 9. Survey Plan

### Distribution

- **Audience:** 200+ responses (English learners 16–45, Ukraine + international EN markets)
- **Channels:** Instagram/Telegram edu communities, university IT groups, teacher Facebook groups
- **Incentive:** 1 month Smart tier raffle (3 winners)
- **Length:** 8–10 minutes

### Survey blocks

**Block A — Screener (4 questions)**

- Age band, current English level (self-assessed CEFR), primary learning goal, devices used

**Block B — Tool usage (5 questions)**

- Likert: "I learn English from video content weekly"
- Multi-select: tools used (YouTube, Netflix, Duolingo, ELSA, tutors, Explys trial)
- MaxDiff: rank motivators (fun, career, exams, travel, pronunciation)

**Block C — Concept test (6 questions)**

- Show hero screenshot mock — "How clear is the value proposition?" (1–7)
- Van Westendorp pricing sensitivity for Smart tier (four price points)

**Block D — Card sorting (embedded)**

- Digital card sort: "Where would you expect to find your weekly learning plan?" (5 nav options)

**Block E — Open text (2 questions)**

- Biggest frustration learning English online
- One feature Explys must ship in v1 to earn your subscription

### Card sorting (survey-embedded)

Same 12-card subset as interview sort for quantitative dendrogram analysis; report similarity matrix and highlight mislabeled Teacher-only items among student respondents.

---

## 10. Insights Mapping

### Cluster A — **Discovery & trust**

| Finding | Source | Action |
|---------|--------|--------|
| SPA limits crawler-visible content | Live fetch | SSR/prerender critical marketing sections |
| No public reviews yet | Search | Launch review campaign + in-app NPS |
| Launch countdown vs. live CTAs | Landing copy | Post-launch remove or replace with social proof |

### Cluster B — **Onboarding complexity**

| Finding | Source | Action |
|---------|--------|--------|
| 3-step registration + placement | Flow docs | Unified progress stepper + save draft |
| Role selection irreversible feel | Heuristic 3 | Confirm modal + "change role" support path |
| Password rules heavy on mobile | Auth copy | Show strength meter inline |

### Cluster C — **Learning loop strength**

| Finding | Source | Action |
|---------|--------|--------|
| Video → quiz → plan loop is differentiated | How-it-works | Highlight in first-run tooltip tour |
| Gamification on Smart tier only | Pricing | Expose mini XP on free tier to hook upgrade |

### Cluster D — **Monetization clarity**

| Finding | Source | Action |
|---------|--------|--------|
| Four tiers + Enterprise mailto | Pricing section | Comparison table sticky on mobile |
| AI features abstract | Feature bullets | 30-sec product demo autoplay (muted) |

### Cluster E — **Accessibility & inclusion**

| Finding | Source | Action |
|---------|--------|--------|
| Zoom disabled | HTML viewport | Remove user-scalable=0 |
| EN/UK bilingual | og:locale | Ensure UK copy parity in all auth strings |

---

## 11. User Persona & JTBD

### Primary persona: **Olena — IT Student**

| Attribute | Detail |
|-----------|--------|
| **Age** | 19 |
| **Location** | Lviv, Ukraine |
| **Occupation** | 2nd-year Computer Science student |
| **English level** | B1 (reading/listening); B1− (speaking) |
| **Tools today** | YouTube tech talks, Duolingo streaks, occasional tutor |
| **Motivation** | Internship interviews with international companies require fluent technical English |
| **Frustrations** | Generic apps don't teach *technical* vocabulary; tutors are expensive; passive video doesn't test comprehension |
| **Tech comfort** | High — lives on mobile + laptop, expects dark mode and fast loads |
| **Explys touchpoints** | Landing via Instagram ad → Student registration → Placement → Catalog (DevOps/genre tags) → Quiz → Learning plan |

### Core JTBD

> **"When I want to improve my professional English, I want to use personalized, video-based learning with AI assessments, so I can accurately measure my comprehension and vocabulary progress without scheduling a human tutor."**

---

## 12. HMW & Crazy 8

### Three pain points → How Might We

| Pain point | HMW statement |
|------------|---------------|
| Users hit placement wall when browsing catalog | **HMW** let visitors experience a meaningful lesson *before* creating an account? |
| Smart tier AI value is invisible until paid | **HMW** show a tangible AI insight (e.g., top 3 grammar gaps) during free onboarding? |
| Multi-step registration causes mobile drop-off | **HMW** reduce perceived signup cost to a single screen without losing personalization data? |

### Crazy 8 — selected HMW

**HMW let visitors experience a meaningful lesson before creating an account?**

| # | Idea | One-line description |
|---|------|----------------------|
| 1 | **Guest clip** | 60-second curated clip on landing with inline 3-question micro-quiz; results locked until signup. |
| 2 | **Try placement lite** | 5-question level sampler on homepage → "Your level: B1 — unlock full catalog." |
| 3 | **Genre preview row** | Horizontal Netflix-style rails on landing (public) linking to signup-gated full player. |
| 4 | **Subtitle game** | Interactive subtitle fill-in-blank on hero video — score displays, account saves progress. |
| 5 | **WhatsApp bot teaser** | Send daily 1-min clip link; deep-link to registration with hobby pre-filled. |
| 6 | **Teacher share link** | Teachers share class preview URL — students watch one assigned video, then register to submit quiz. |
| 7 | **AR word hunt** | Mobile camera labels objects in English — gamified hook → "Continue in app." |
| 8 | **Live countdown unlock** | Daily free featured lesson unlocked during launch week without account. |

---

## 13. Prioritization Mapping

### Impact vs. Effort matrix

```
                    HIGH IMPACT
                         │
    Quick wins           │           Strategic bets
    ─────────────────────┼─────────────────────────
    • Guest clip +       │    • SSR/prerender landing
      micro-quiz (#1)    │      for SEO
    • Remove zoom lock   │    • Unified registration
    • Progress stepper   │      stepper + save draft
      on signup          │    • AI insight preview
    • "Most popular"     │      on free tier (#2)
      sticky on mobile   │
    • Fix meta desc typo │    • Public genre preview
                         │      rails (#3)
    ─────────────────────┼─────────────────────────
    Fill-ins             │           Avoid / defer
    • AR word hunt (#7)  │    • WhatsApp bot (#5)
    • Live daily unlock  │      (ops overhead)
      (#8) long-term     │    • Full pricing A/B
                         │      before baseline data
                    LOW IMPACT
         LOW EFFORT ──────────────── HIGH EFFORT
```

### Recommended sprint order

1. Guest clip + micro-quiz (High / Medium)
2. Registration progress stepper (High / Low)
3. Accessibility viewport fix (Medium / Low)
4. AI insight teaser post-placement (High / High)
5. SSR for landing sections (High / High)

---

## 14. Customer Journey Map

### Stages: Awareness → Conversion → Retention

| Stage | User actions | Touchpoints | Thoughts | Pain points | Opportunities |
|-------|--------------|-------------|----------|-------------|---------------|
| **Awareness** | Sees ad / search result / friend share | Google, social, `explys.com` | "Is this another Duolingo?" | Generic edtech skepticism | Sharper hero demo; IT/tech niche messaging |
| **Consideration** | Scrolls landing, checks pricing, reads How it works | Hero, Features, Pricing, Countdown | "Videos sound fun — but is there real learning?" | AI benefits abstract; no testimonials | Embed 30-sec learner story; CEFR badge |
| **Conversion** | Clicks Get started → 3-step register → email verify | `/registrationMain` → details → preferences | "Why so many questions?" | Role/plan confusion; password fatigue | Stepper, defaults, social signup |
| **Activation** | Placement → learning plan → first video + quiz | `/catalog`, `/level-test`, `/learning-plan`, `/content/:id` | "Finally watching something I like" | Placement length; catalog empty state | Preview genres; celebrate first quiz XP |
| **Retention** | Returns for plan suggestions, streaks, upgrades | Profile, watched lessons, subscribe | "Am I actually improving?" | Smart tier paywall for deep analytics | Weekly email recap; free mini-analytics |
| **Advocacy** | Shares with classmates / colleagues | Word of mouth, teacher invites | "My students would like this" | No referral program visible | Teacher referral + family plan upsell |

### Critical moment

**First quiz completion within 24h of signup** — design all onboarding nudges toward this event.

---

## 15. Information Architecture

### Proposed sitemap (observed + recommended labels)

```
explys.com/
├── /                          Home (landing)
│   ├── #release-countdown
│   ├── #why-choose-explys
│   ├── #how-explys-works
│   └── #ready-to-start
├── /pricing                   Full pricing page
├── /catalog                   Lesson catalog (auth + placement gate)
│   └── /catalog/series/:slug  Series detail
├── /content/:id               Video lesson player
├── /content/:id/summary       Post-lesson summary
├── /watched-lessons           History
│   └── /watched-lessons/recap/:kind
├── /learning-plan             Student roadmap
├── /profile                   Profile & stats
├── /subscribe                 Plan selection / upgrade
├── /loginForm                 Sign in
├── /registrationMain          Sign up (multi-step)
├── /level-test                Placement (gated)
└── /admin/*                   Admin (disallow robots)

External: api.explys.com (API)
Contact: sales@explys.com (Teacher / Enterprise)
```

### Navigation logic

| User state | Primary nav | Secondary |
|------------|-------------|-----------|
| **Anonymous** | Home anchors, Pricing, Catalog*, Log in, Get started | *Catalog may redirect to auth |
| **Registered (no placement)** | Continue setup banner → Placement | Profile (limited) |
| **Active learner** | Catalog, Learning Plan, Profile | Watched lessons, Subscribe |
| **Teacher** | Dashboard, Students, Assignments | Admin/LMS tools |
| **Admin** | `/admin` console | Separate from learner IA |

### IA recommendations

1. Rename `/registrationMain` → `/register` (user-friendly URL).
2. Add public **Help / FAQ** under footer Product column.
3. Surface **Learning Plan** in main nav post-placement (currently easy to lose in deep routes).
4. Ensure card sort validates **Catalog vs. Learning Plan** hierarchy — users often conflate "what to watch" with "what to watch *next*."

---

## 16. Rapid Testing Params

### Five-Second Test (recall)

**Objective:** Measure value-proposition clarity on landing hero.

| Parameter | Spec |
|-----------|------|
| **Stimulus** | Above-the-fold screenshot of explys.com home (desktop 1440px + mobile 390px) |
| **Exposure** | 5 seconds, no scroll |
| **Participants** | n = 20 per variant (40 total if A/B hero copy) |
| **Tasks (written after exposure)** | 1) What does this product do? 2) Who is it for? 3) Name one feature you remember. 4) Would you sign up? (Y/N) |
| **Success criteria** | ≥70% mention "English" + "video" or "learning"; ≥50% recall personalization/adaptive; ≤20% blank or "not sure" |
| **Failure signal** | Confusion with streaming entertainment only ("Netflix") without education cue |

### Hallway Testing (comprehension)

**Objective:** Observe first-time registration + placement comprehension without facilitator hints.

| Parameter | Spec |
|-----------|------|
| **Participants** | 5 hallway users (non-team, B1 English) |
| **Scenario script** | "You want to improve English for a software job interview in 3 months. Use this site to start learning." |
| **Tasks** | 1) Find pricing 2) Create student account 3) Reach first video 4) Complete quiz |
| **Metrics** | Task success (Y/N), time-on-task, error count, SUS (10-item) |
| **Success criteria** | ≥4/5 reach catalog; ≤1 critical assist; SUS ≥ 68 |
| **Stop rules** | P0 bug (crash, cannot register) halts test; log and fix before next cohort |

### Reporting

- Compile within 48h: highlight reel clips (with consent), top 3 verbatim quotes, go/no-go for marketing spend.

---

## 17. Design Handoff

### Deliverables for designers

| Artifact | Format | Owner |
|----------|--------|-------|
| Updated customer journey map (FigJam) | FigJam board | UX Research |
| Persona card — Olena + secondary Teacher persona | Figma component | UX Research |
| Registration + placement unified stepper wireframes | Figma flows | Product Design |
| Guest lesson / micro-quiz landing concept | Figma hi-fi + prototype | Product Design |
| Impact/Effort prioritized backlog | Linear/Jira epic | PM + UX |
| Card sort dendrogram + IA label recommendations | PDF + spreadsheet | UX Research |
| Five-Second + Hallway test report | Google Doc | UX Research |

### Deliverables for developers

| Item | Spec |
|------|------|
| **Accessibility** | Remove `user-scalable=0`; fix `meta name="description"` typo |
| **Analytics events** | Implement funnel events listed in §6 |
| **SSR / prerender** | Landing hero, features, pricing sections for SEO |
| **Registration UX** | Persistent step indicator; save partial registration server-side |
| **Guest mode spike** | Technical spike for anonymous 60s clip + 3-question quiz |
| **Empty states** | Catalog and learning plan zero-data UI copy |
| **Performance budget** | LCP < 2.5s on 4G for landing (Cloudflare already in place) |

### Deliverables for stakeholders

| Artifact | Purpose |
|----------|---------|
| Executive 1-pager | Top 5 findings + ROI-linked recommendations |
| Competitive positioning slide | Video-first vs. speaking-first matrix |
| 90-day UX roadmap | Quick wins → strategic bets from §13 |
| KPI dashboard mock | Funnel from §6 wired to GA4 |

### Definition of done (UX research phase)

- [ ] All 17 report sections reviewed with Product + Engineering
- [ ] ≥5 user interviews completed OR scheduled with scripts finalized
- [ ] Survey live with n ≥ 50 within 2 weeks of launch
- [ ] Top 3 backlog items estimated and sprint-ready
- [ ] Five-Second test run on current hero before next copy change

---

*Report generated per UX Research Master Execution Sequence. Primary sources: https://explys.com (live fetch), https://explys.com/robots.txt, Mordor Intelligence digital English learning market reports (2026), competitor public sites (ELSA Speak, Speakerly, Langly).*
