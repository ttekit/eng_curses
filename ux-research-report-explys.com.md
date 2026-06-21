# UX Research Report: explys.com

**Audit date:** 2026-06-18  
**Scope:** Public marketing site + auth gates (`/`, `/pricing`, `/about`, `/loginForm`, `/registrationMain`, `/catalog`, legal pages). Authenticated catalog/lesson player not accessible without credentials in this fetch.

---

## 1. Desk Research

### Product positioning
Explys positions as a **personalized English learning platform** using adaptive video lessons (movies, series, educational clips), subtitles, in-lesson comprehension quizzes, AI-assisted grading (Gemini per Terms), placement testing, and phased student learning plans. Tiers: Light ($7/mo), Smart ($12/mo, “Most popular”), Family ($19/mo), Teacher (custom/enterprise LMS).

**Sources:** [explys.com](https://explys.com/), [explys.com/pricing](https://explys.com/pricing), [explys.com/terms](https://explys.com/terms), [explys.com/about](https://explys.com/about)

### Domain / brand signals
| Signal | Finding |
|--------|---------|
| User scale (marketing) | “3315 users”, “500+ videos”, “10k+ hours” on homepage hero |
| Free vs paid | FAQ states use is “completely free” today; pricing page says “Sign in to subscribe”; banner “Free access in June 2026!” |
| Locale | EN primary; demo player shows Ukrainian `-10 сек` on homepage; `uk_UA` alternate referenced in site metadata |
| Platform | React SPA (thin HTML shell); Stripe on pricing |
| SEO / crawl | `sitemap.xml` returns **500**; `/login` returns **404** (working login: `/loginForm`) |

### Forum / social sentiment
**No dedicated public review corpus found** for Explys (English video EdTech) in App Store, Trustpilot, or Reddit at audit time. Search surfaces **Exply** (BI analytics, docs.exply.io) and tutoring marketplaces (Preply, iTalki)—name collision risk for brand discovery and trust.

**Implication:** Social proof relies entirely on on-site counters (3,315 users) without third-party validation; Explorer personas lack external reassurance.

### Industry trends (2026)
- Digital English learning market expanding ~15–17% CAGR; shift toward **AI personalization** and **mobile-first** delivery ([GII Research 2026](https://www.giiresearch.com/report/tbrc1960554-digital-english-language-learning-global-market.html)).
- Category leaders (Duolingo, Babbel) emphasize **freemium scale**, **app store presence**, and **documented learner outcomes**; AI conversation/video features now table stakes ([LingoBright 2026 stats](https://www.lingobright.com/statistics/language-learning-apps/)).
- Hybrid learning (self-study + structured paths + optional live/B2B) is the norm; Explys competes in **media-native self-study** niche closest to ELSA “Media Learners” segment rather than tutoring marketplaces.

---

## 2. Nielsen Heuristics

| # | Heuristic | Rating | Site-specific evidence |
|---|-----------|--------|------------------------|
| 1 | Visibility of system status | **Mixed** | Homepage demo player shows `0:00/0:00` static state; “Free access in June 2026!” vs FAQ “completely free” vs paid tier cards creates ambiguous billing state. **Interactive State Uniformity:** Primary CTAs use consistent pill/button styling on homepage/pricing; sign-in form shows clear field labels and Google OAuth alternative. Focus/disabled/loading states not observable on marketing pages. `/catalog` unauthenticated shows login—not a catalog preview—without explaining the gate. |
| 2 | Match between system and real world | **Mixed** | “Browse content” implies open catalog; live behavior is sign-in wall. URLs use legacy paths (`/loginForm`, `/registrationMain`) while users expect `/login`, `/register` (404 on `/login`). |
| 3 | User control and freedom | **Good** | Footer links to About, Privacy, Terms, Feedback; pricing FAQ expandable; “Full pricing page” from homepage. |
| 4 | Consistency and standards | **Weak** | EN homepage with Ukrainian `-10 сек` in demo controls; “Sign in to subscribe” vs “completely free” messaging; camelCase routes vs kebab-case expectations. |
| 5 | Error prevention | **Mixed** | Registration form collects password + confirm; login offers forgot password. No preview of placement length before signup. |
| 6 | Recognition rather than recall | **Good** | Four-step “How Explys works” with numbered steps; tier feature bullets on homepage and `/pricing`. |
| 7 | Flexibility and efficiency | **Mixed** | Google OAuth on login/register. Search/Cmd+K not advertised on marketing site. Teacher “Contact us” for enterprise—no self-serve demo scheduler visible. |
| 8 | Aesthetic and minimalist design | **Good** | Clean dark marketing aesthetic; scannable feature grid (“Why choose Explys?”); hero chameleon metaphor supports brand. |
| 9 | Help users recognize, diagnose, recover from errors | **Weak** | `/login` 404 offers only “Return to main page”—no link to `/loginForm`. `sitemap.xml` 500—no user-facing recovery. |
| 10 | Help and documentation | **Partial** | FAQ on homepage/pricing; About + Feedback form; Telegram in footer (from About copy). No header Help/Docs link; privacy policy contains outdated Facebook permission boilerplate. |

**Interactive State Uniformity (Heuristic #1 detail):** Hero CTAs (“Start learning free”, “Browse content”) share visual weight; secondary CTA does not signal authentication requirement. Pricing tier buttons (“Select Light”, “Start with Smart”) appear actionable but copy says sign-in required—hover/active distinction not verifiable in fetch; risk of **false affordance** on plan CTAs during free-promo period.

---

## 3. Usability Audit

### Informational Hierarchy
| Zone | High-intent anchors visible? | Issue |
|------|------------------------------|-------|
| Homepage hero | **Yes:** dual CTAs, social proof counts | Price not above fold (Explorer-friendly); Fast Buyer must scroll to pricing section or visit `/pricing` |
| Homepage pricing strip | **Yes:** $7 / $12 / $19 + “Most popular” | “Sign in to subscribe” de-emphasized vs button labels; free FAQ contradicts paid framing |
| `/pricing` | **Yes:** tier matrix, FAQ, Stripe trust line | Teacher row “Custom / Enterprise” without price anchor |
| `/catalog` (unauth) | **No:** login form replaces expected catalog | **Critical:** decision data (content taste) buried behind auth |

**Verdict:** Marketing hierarchy serves **Explorer** (story → features → steps) adequately; **Fast Buyer** price/time-to-first-lesson requires scroll or second page. **Browse content** promises catalog preview but delivers login—hierarchy breaks at first secondary CTA click.

### De-duplication of Navigation
| Element | Occurrences | Recommendation |
|---------|-------------|----------------|
| “Start learning free” / “Get started” | Hero, CTA section, pricing banner, footer account links | Consolidate to one primary + one secondary per viewport |
| Pricing summary | Homepage mid-page + `/pricing` + footer “Pricing” | Acceptable if homepage block is teaser; ensure tier copy identical (verified: aligned) |
| Login / register paths | Footer, header (in app shell), `/loginForm`, broken `/login` | **P0:** Redirect `/login` → `/loginForm`; single canonical URL |
| FAQ content | Homepage accordion + pricing FAQ | Partial overlap (“What is Explys?”, personalization)—merge or cross-link once |

**Count:** ~4 parallel entry paths to signup/login; ~2 broken/conventional URL mismatches.

### Additional UX laws

**Hick’s Law — role/plan choice:** Four B2C tiers + Teacher row on first pricing view increases decision load. “Most popular” on Smart helps; Family vs Smart distinction requires reading four bullets each.

**Jakob’s Law — URL expectations:** `/login` 404 violates convention; increases cognitive friction for returning users and ad/email links.

**Peak–end rule:** Homepage ends with strong CTA (“Get started free” + “How it works”); positive. Unauthenticated `/catalog` peak is **login wall** after “Browse content”—likely negative peak if user expected clips.

**Fitts’s Law:** Mobile header CTAs (from marketing shell) appear in top bar; primary hero buttons full-width on small screens—good target size on homepage; pricing tier buttons stacked on mobile—acceptable.

---

## 4. Competitive Analysis

### Named competitors
1. **Duolingo** — [duolingo.com](https://www.duolingo.com) — freemium gamified scale, app-first, Duolingo Max AI/video call  
2. **Babbel** — [babbel.com/prices](https://www.babbel.com/prices) — structured subscription courses, 14 languages, 1.6M 5-star ratings cited  
3. **ELSA Speak** — [elsaspeak.com](https://elsaspeak.com/en) — AI speaking + **Media Learners** segment, 92M+ downloads, free tier + B2B/schools  

Explys is closest to **ELSA / media-native** positioning (video/listening) rather than Duolingo drills or Babbel lesson modules.

### Feature comparison

| Capability | Explys | Duolingo | Babbel | ELSA Speak |
|------------|---------|----------|--------|------------|
| Video/movie-based lessons | **Core** (500+ videos claimed) | Limited (Max video call) | Some video content | Media learner persona |
| Placement / level test | Yes (step 2 in How it works) | Yes | Yes | Yes |
| In-content quizzes | Yes (step 4) | Yes | Yes | Role-play / speaking |
| Free start | Claimed (FAQ: completely free) | Strong freemium | Trial/subscription | Free tier listed |
| App store presence | Not prominent on marketing site | App Store + Play badges | App CTAs + download stats | 92M+ downloads cited |
| Social proof | 3,315 users (on-site) | “World’s most popular” | 1.6M ratings / 47.4M downloads | 90M+ learners testimonials |
| Family plan | $19/mo, 3 profiles | Duolingo Super Family | Group plans | Individual focus |
| Teacher / school LMS | Teacher tier + dashboard features | Duolingo for Schools (free) | Enterprise pivot | ELSA Schools/Business |
| Public pricing | $7 / $12 / $19 + custom | Freemium + Super | Subscription tiers | Free + custom B2B |
| Browse without account | **No** (`/catalog` → login) | Partial marketing preview | Marketing + trial | Marketing + app download |

**Explys differentiation:** CEFR-aligned **video catalog + comprehension loop + AI learning plan** in one product. **Gap vs leaders:** app distribution, third-party reviews, and pre-auth content sampling.

---

## 5. Google Analytics (Simulated)

*Simulated until GA4/PostHog production access. Instrumentation recommendations included.*

### Assumed traffic mix
| Channel | Share | Notes |
|---------|-------|-------|
| Organic search | 35% | Risk from `/login` 404, `sitemap.xml` 500 |
| Direct / brand | 25% | Exply vs Exply BI confusion |
| Paid social | 20% | Landing on homepage; track CTA variant |
| Referral (Telegram, teachers) | 15% | Footer/About Telegram |
| Other | 5% | |

### Funnel (monthly, illustrative 10k sessions)
| Step | Users | Conv. | Drop-off signal |
|------|-------|-------|-----------------|
| Homepage view | 10,000 | — | |
| CTA click (any) | 2,200 | 22% | Browse vs Start split |
| Registration start | 1,100 | 50% of clicks | `/registrationMain` |
| Registration complete | 660 | 60% | Multi-step wizard |
| First catalog open | 660 | 100% | Gated |
| Placement complete | 462 | 70% | In-app (not in fetch) |
| First lesson complete | 277 | 60% | In-app |
| Paid subscribe | 42 | 15% of activated | If free promo ends |

### Events to instrument (P0)
- `cta_click` {label: start_free | browse_content | pricing_tier}
- `auth_gate_hit` {from_url: /catalog}
- `registration_step` {step: 1|2|3}
- `placement_started` / `placement_completed`
- `lesson_started` / `lesson_completed` / `quiz_submitted`
- `checkout_started` / `checkout_success`
- `404_hit` {path: /login | /register | ...}

---

## 6. Research Hypotheses

1. **H1:** Users who click “Browse content” before registering abandon at higher rates than “Start learning free” because `/catalog` shows login without explaining value behind the gate.  
   *Metric:* Gate bounce rate; time on login page by referrer CTA.

2. **H2:** Contradictory free vs paid messaging (FAQ “completely free” + tier prices + June 2026 banner) reduces paid conversion when promo ends.  
   *Metric:* Pricing page scroll depth → checkout start; survey trust score.

3. **H3:** Placement described only post-signup causes signup drop for Fast Buyers who want duration estimate upfront.  
   *Metric:* Signup completion when hero subcopy includes “~5 min placement” vs control.

4. **H4:** Legacy URLs (`/loginForm`) increase support contacts and 404s on `/login`.  
   *Metric:* 404 rate; successful login by entry URL.

5. **H5:** Lack of app store badges reduces mobile signup vs competitors.  
   *Metric:* Mobile registration rate after adding App/Play CTAs with deep links.

---

## 7. Interviews Testing Plan

### Participant segments (n=6–8 per round)
| Segment | Criteria | Focus |
|---------|----------|-------|
| A1 | Adult learner, 15 min/day, job-related English | Fast Buyer path, pricing, placement |
| A2 | Student 16–22, consumes English media | Explorer path, content taste |
| A3 | Parent considering Family tier | Profiles, controls, price |
| A4 | Private English teacher, 10–40 students | Teacher tier, LMS features |
| A5 | Returning user lapsed 30+ days | Re-entry, learning plan |
| B1 | Ukrainian locale preference | Language toggle, `-10 сек` inconsistency |
| B2 | Mobile-only user | Registration + first lesson on phone |

### 60-minute session flow
1. Context questions (5 min)  
2. Homepage think-aloud → first CTA (10 min)  
3. Task: “Find a lesson that matches your interests without creating an account” (fail expected—observe reaction) (5 min)  
4. Registration + placement (15 min)  
5. First lesson + quiz (15 min)  
6. Pricing comprehension (5 min)  
7. Debrief + SUS (5 min)

### Card-sorting protocol
- **Closed sort:** Homepage sections (Hero, Why choose, How it works, Pricing, FAQ, Footer)—ask optimal order for “deciding to try Explys.”  
- **Open sort:** 12 feature cards (video library, AI plan, quizzes, XP, teacher dashboard, family profiles, etc.) into “Must have before signup” / “Nice later” / “Don’t care.”

---

## 8. Survey Plan

### Screening (5 questions)
- Learning English for work/study/leisure?  
- Hours per week available?  
- Currently use Duolingo/Babbel/other? (Y/N)  
- Device preference (mobile/desktop)?  
- Willing to pay for learning apps? ($0 / <$10 / $10–20 / $20+)

### Likert blocks (1–7)
- “I understood how Explys personalizes lessons before signing up.”  
- “I trust the price shown matches what I will pay.”  
- “I could find content that matches my interests easily.”  
- “The signup process felt appropriately short.”  
- “I would recommend Explys to a colleague.” (NPS follow-up)

### Open text
- “What almost stopped you from signing up?”  
- “What did you expect ‘Browse content’ to do?”

### Optional card-sort validation (remote)
Mirror interview card sort via OptimalSort; n≥30 for segment comparison (Fast Buyer vs Explorer).

---

## 9. Insights Mapping

| Cluster | Findings | Impact | Action |
|---------|----------|--------|--------|
| **Gate mismatch** | `/catalog` → login; “Browse content” breaks promise | High abandonment at exploration CTA | Public catalog teaser (3 clips) or rename CTA to “Sign in to browse” |
| **Messaging trust** | Free FAQ + paid tiers + promo banner | Conversion cliff when promo ends | Single source of truth on pricing hero; date-bound promo module |
| **Wayfinding** | `/login` 404; camelCase URLs | SEO, email links, support load | Redirects + canonical URLs |
| **Social proof gap** | 3,315 users only; no external reviews | Explorer hesitation | Testimonials, teacher quotes, or pilot metrics |
| **Locale quality** | `-10 сек` on EN homepage | Trust for EN-first users | Fix i18n on demo widget |
| **B2B path** | Teacher tier features listed; “Contact us” only | Medium pipeline quality | Calendar embed + feature PDF for schools |
| **Technical SEO** | `sitemap.xml` 500 | Organic discovery | Fix sitemap generation |
| **Competitive parity** | No app store CTAs vs Duolingo/ELSA | Mobile acquisition gap | Add store badges when apps live |

---

## 10. Persona & JTBD

**Persona A (Fast Buyer):** Olena, 29, marketing coordinator in Kyiv, 20 min/day on phone. Needs **price**, **free start without card**, and **time to first lesson** before committing. Frustrated by login walls, unclear placement length, and `/login` 404 from bookmarked link. Needs pricing table and “Start free → placement (~5 min) → first clip” above the fold.

**Persona B (Explorer):** Marco, 22, film student in Milan, learns English through series. Needs **proof of content taste** (genres, sample clip, how quizzes tie to scenes) and **brand story** before price. Abandons if “Browse content” hits a login form without a trailer or sample lesson. Needs embedded sample video on homepage and explicit “movies & series” examples.

**JTBD:** “When I want English that fits how I actually consume media, I want lessons built around videos I enjoy and quizzes that prove I understood, so I can improve listening and vocabulary without a boring textbook app.”

---

## 11. HMW & Crazy 8

### HMW (from top pain points)
1. HMW let Explorers ** taste the catalog** before creating an account?  
2. HMW make **free vs paid status** obvious at every CTA?  
3. HMW reduce **auth friction** for returning users with conventional URLs and clear next steps?

### Crazy 8 — HMW #1 (public catalog taste)
1. Homepage embed: 60s featured clip with 2 quiz questions (no account).  
2. “Preview mode” on `/catalog`: 5 public trailers; rest blurred.  
3. YouTube-style row of genres on landing with 1 free episode each.  
4. Interactive hero: play demo quiz on marketing video already on homepage.  
5. Email capture → magic link to one full lesson (no password yet).  
6. Teacher-shared deep links that open one assignment publicly.  
7. “Try placement preview” — 3 questions without account, then signup to save.  
8. Sticky mini-player persisting across marketing pages until signup.

---

## 12. Prioritization Mapping

| Initiative | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Fix `/login` → `/loginForm` redirect + canonical URLs | High | Low | **P0** |
| Align “Browse content” with behavior (teaser or rename) | High | Medium | **P0** |
| Unify free/paid messaging (FAQ + banner + pricing) | High | Low | **P0** |
| Fix homepage demo locale (`-10 сек`) | Medium | Low | **P1** |
| Repair `sitemap.xml` 500 | Medium | Low | **P1** |
| Add placement duration to step 2 marketing copy | Medium | Low | **P1** |
| Public sample lesson / video row on homepage | High | Medium | **P1** |
| App store CTAs when available | Medium | Medium | **P2** |
| Teacher tier: Calendly + one-pager PDF | Medium | Medium | **P2** |
| External testimonial / review strip | Medium | High | **P2** |
| Privacy policy refresh (remove stale Facebook scopes) | Low | Medium | **P3** |

---

## 13. Customer Journey Map

| Stage | Actions | Touchpoints | Pain | Opportunity | Emotional / Transactional note |
|-------|---------|-------------|------|-------------|-------------------------------|
| **Awareness** | Search “learn English with movies”, land on hero | Google, social, Telegram | Brand confusion with Exply BI | Clarify tagline in meta/ads | **Emotional:** chameleon/adaptation story works for Explorer |
| **Consideration** | Read features, How it works, FAQ | Homepage sections | No third-party reviews | Add 2–3 learner quotes | **Emotional** before **transactional** — good order on homepage |
| **Intent** | Click “Browse content” or “Start learning free” | Hero CTAs | Browse → login shock | Teaser or honest CTA label | **Transactional break:** promise vs gate mismatch |
| **Signup** | `/registrationMain`, Google OAuth | Auth forms | Legacy URL if shared `/register` | Redirects + progress indicator | Mixed: welcome copy emotional; fields transactional |
| **Onboarding** | Placement + learning plan (post-login) | Catalog overlay (per marketing copy) | Length unknown pre-signup | State duration in marketing | **Transactional** dominates; needs reassurance |
| **First value** | Watch lesson + quiz | Lesson player (gated) | Not verifiable in public audit | Instrument time-to-first-quiz | Target **peak:** quiz win moment |
| **Conversion** | Choose Light/Smart/Family | `/pricing`, `/subscribe` | “Sign in to subscribe” vs “free” | Promo countdown + tier anchor | **Transactional** — trust critical |
| **Retention** | Learning plan, streak, profile | App shell | — | Email streak reminders | Balance gamification preview on marketing (EDU-06) |

**Emotional vs transactional balance:** Homepage earns **Explorer** engagement (video metaphor, features, steps) before pricing section—appropriate. **Gap:** secondary CTA triggers **transactional gate** too early without emotional sampling (no clip browse). Pricing section introduces tiers before some users experience product—acceptable for Fast Buyer if free period is real, risky if messaging conflicts.

---

## 14. Information Architecture

### Observed public sitemap (ASCII)
```text
explys.com/
├── / (landing: hero, why, how, pricing strip, FAQ, CTA)
├── /pricing
├── /about
├── /feedback
├── /privacy
├── /terms
├── /loginForm          ← working auth
├── /registrationMain   ← working signup
├── /catalog            ← unauthenticated → login content
├── /learning-plan      ← likely gated (site instructions)
├── /login              ← 404
└── /sitemap.xml        ← 500
```

### Recommended sitemap
```text
explys.com/
├── / (marketing)
├── /pricing
├── /sample             ← 1–3 public preview lessons (NEW)
├── /how-it-works       ← optional dedicated page from anchor
├── /for-teachers       ← B2B landing (NEW)
├── /about | /feedback | /legal/*
├── /login              ← redirect → /login (canonical)
├── /register           ← redirect → /registration (canonical)
└── app.explys.com/     ← optional split: authenticated app (future)
    ├── /catalog
    ├── /learning-plan
    ├── /profile
    └── /content/:id
```

### Scalable modular blocks (marketing system)
| Block | Reuse |
|-------|-------|
| Hero + dual CTA + social proof | All landing variants |
| 4-step “How it works” | Home, teacher page, ads |
| Tier comparison table | Home teaser + `/pricing` full |
| FAQ accordion | Pricing objections, teacher page |
| Sample video + micro-quiz | Home, `/sample`, retargeting |
| Trust strip | Stripe, terms, privacy, support email |
| Sticky mobile CTA | “Start free” after scroll 40% |

---

## 15. Rapid Testing Params

### Five-second test (n=20)
**Stimulus:** Homepage above-fold screenshot (desktop + mobile).  
**Question:** “What does this product do, and what would you click first?”  
**Pass criteria:** ≥70% mention video/movies/English; ≥50% identify primary CTA; ≤10% say “unclear.”

### Hallway test (n=5, 10 min each)
**Tasks:**
1. Find monthly price for one person.  
2. Explain what happens after you create an account (in your own words).  
3. Browse a lesson without signing up.  

**Pass criteria:** Task 1 ≥80% success ≤60s; Task 2 ≥60% mention placement/plan; Task 3 **expected fail today**—document frustration verbatim for P0 case.

---

## 16. Design Handoff

### Design
- [ ] Redesign hero secondary CTA label or add public sample module  
- [ ] Pricing promo module: single timeline (free until X → tier Y)  
- [ ] Fix demo player i18n; add EN-only screenshot for ads  
- [ ] 404 page: suggest `/loginForm` and `/registrationMain`  
- [ ] Teacher page wireframe: dashboard screenshots + contact CTA  
- [ ] Optional: app store badge row  

### Engineering
- [ ] Redirect `/login`, `/register`, `/signup` → canonical auth routes  
- [ ] Fix `sitemap.xml` 500  
- [ ] `robots.txt` audit (timeout on fetch—verify allow/disallow)  
- [ ] GA4/PostHog events per §5  
- [ ] A/B infra for Browse CTA variants  
- [ ] Public read-only catalog endpoint or static preview pages  

### Stakeholder
- [ ] Align promo policy: free through June 2026 vs tier launch  
- [ ] Approve public sample content licensing for marketing clips  
- [ ] Define review collection plan (Trustpilot / app store)  
- [ ] Teacher sales: contact routing (email vs calendar)  

### Release acceptance criteria
- `/login` resolves without 404  
- “Browse content” behavior matches label OR label updated  
- Homepage FAQ pricing language consistent with `/pricing`  
- Five-second test pass rate ≥70% on value prop  
- `sitemap.xml` returns 200 valid XML  

---

## 17. Industry Playbook

**Classification:** [edtech-language-learning.md](file:///Users/ttekit/.cursor/skills/ux-research-pipeline/industries/edtech-language-learning.md) (primary) | [b2b-saas.md](file:///Users/ttekit/.cursor/skills/ux-research-pipeline/industries/b2b-saas.md) (secondary — Teacher LMS tier) | **Confidence:** **High** (video catalog, placement, learning plan, quizzes, tiered pricing, Teacher enterprise row)

| Tactic | Do this | Typical uplift | Source | Site status | Evidence on explys.com |
|--------|---------|----------------|--------|-------------|------------------------|
| EDU-08 | Sample genres + browse path on homepage | ~5–12% Explorer conversion | Content-based EdTech marketing tests | **Gap** | “Browse content” CTA → `/catalog` shows **login**, not clips/genres |
| EDU-01 | “Start free” above fold; no credit card; time-to-account <2 min stated | ~15–30% signup completion | PLG / EdTech onboarding benchmarks | **Partial** | “Start learning free” prominent; FAQ says free; no explicit “no credit card” on hero; tier CTAs say “Sign in to subscribe” |
| EDU-02 | Placement explained on homepage + step 2; show duration | ~10–20% activation after signup | Duolingo/Babbel-style onboarding research | **Partial** | Step 02 “Complete placement” in How it works; **no duration** (e.g. “5 min”) on marketing pages |
| EDU-04 | Scannable tiers; highlight most popular; feature bullets | ~5–12% paid conversion | Baymard-style plan comparison (adapted subscriptions) | **Met** | Light/Smart/Family/Teacher on `/pricing`; **“Most popular”** on Smart; bullet lists per tier |
| EDU-12 | Stripe/trust copy + terms near plan buttons | ~3–6% checkout completion | Subscription trust patterns | **Met** | “Payments are processed securely by Stripe… agree to our terms” on `/pricing` |
| EDU-03 | Show roadmap/phases before paywall | ~8–15% week-1 retention | Learning science — goal visibility | **Partial** | Step 03 describes student learning plan; full plan **not visible** until post-login |
| EDU-05 | Video + subtitles + quiz while clip fresh | ~10–18% lesson completion | MOOC/video-course UX studies | **Partial** | Step 04 describes loop; **not observable** on public site without account |
| EDU-09 | Learner vs teacher split + Teacher pricing with sales CTA | ~10–20% B2B pipeline quality | B2B EdTech funnel benchmarks | **Partial** | Registration/marketing mentions teachers; Teacher tier + **“Contact us”**; no `/for-teachers` landing |
| EDU-06 | XP/achievements preview on marketing | ~5–10% DAU | Gamified learning engagement literature | **Partial** | “Gamified progress” feature bullet; **no screenshot/streak preview** on marketing |
| EDU-07 | Progress analytics promise tied to mid tier | ~4–8% upgrade to mid tier | Subscription upsell patterns | **Partial** | Smart tier lists “Deep progress analytics”; **no sample dashboard** on site |
| EDU-10 | Family profiles, parental controls visible | ~3–8% ARPU (family attach) | Consumer subscription family plans | **Met** | Family tier: “Up to 3 profiles”, parental controls, tournaments |
| EDU-11 | Mobile lesson ergonomics; app links | ~8–15% mobile completion | Mobile learning UX composite | **Gap** | No App Store / Google Play CTAs on fetched marketing pages |
| SaaS-02 | Demo vs trial split for enterprise | ~8–15% lead quality | Gartner / PLG benchmarks | **Partial** | Learner self-serve signup vs Teacher **“Contact us”**; no “Book demo” calendar |
| SaaS-06 | Feature comparison table with checkmarks | ~5–12% paid conversion | Baymard-style comparison (adapted B2B) | **Partial** | Tier bullets yes; **no side-by-side checkmark matrix** across all four tiers |
| SaaS-08 | Docs link in header | ~3–7% trial retention | SaaS support deflection metrics | **Gap** | No Help/Docs in marketing header; Feedback form only |
| SaaS-03 | Security/compliance strip for enterprise | ~5–10% enterprise trust | B2B buyer surveys | **Gap** | Teacher tier lacks SOC2/GDPR/SSO trust strip; Terms mention COPPA/GDPR in legal prose only |

**Top 3 playbook-backed P0 actions (cross-link §12):**
1. **EDU-08 — Public content taste:** Fix Browse CTA / add sample clips so Explorers see media proof before auth (§12 P0).  
2. **EDU-01 — Frictionless free start clarity:** Reconcile FAQ “completely free”, June 2026 banner, and tier pricing in one promo module; add “No credit card required” if true (§12 P0).  
3. **EDU-02 + wayfinding:** Add placement duration to Step 02 marketing copy; redirect `/login` → canonical login (§12 P0/P1).

---

*Sources:* https://explys.com/ · https://explys.com/pricing · https://explys.com/about · https://explys.com/loginForm · https://explys.com/registrationMain · https://explys.com/catalog · https://explys.com/login · https://explys.com/terms · https://explys.com/privacy · https://explys.com/feedback · https://explys.com/sitemap.xml · https://www.duolingo.com · https://www.babbel.com/prices · https://elsaspeak.com/en · https://www.lingobright.com/statistics/language-learning-apps/ · https://www.giiresearch.com/report/tbrc1960554-digital-english-language-learning-global-market.html · Site instructions: `~/.cursor/skills/ux-research-pipeline/industries/sites/explys.com.md` · **Fetch date:** 2026-06-18
