# UX Research Report: explys.com

**Audit date:** 2026-07-02  
**Scope:** Public marketing site + auth gates (`/`, `/pricing`, `/about`, `/login`, `/register`, `/catalog`, legal pages). Authenticated lesson player not accessible without credentials in this fetch.

---

## 1. Desk Research

### Product positioning
Explys positions as a **personalized English learning platform** using adaptive video lessons (movies, series, educational clips), subtitles, in-lesson comprehension quizzes, AI-assisted practice (Gemini per Terms), placement testing, and phased student learning plans. Tiers: Light ($7/mo), Smart ($12/mo, “Most popular”), Family ($19/mo), Teacher (custom/enterprise LMS).

**Sources:** [explys.com](https://explys.com/), [explys.com/pricing](https://explys.com/pricing), [explys.com/terms](https://explys.com/terms), [explys.com/about](https://explys.com/about)

### Domain / brand signals
| Signal | Finding |
|--------|---------|
| User scale (marketing) | “3315 learners”, “500+ videos”, “10,000+ hours” on homepage hero (static fallback; live count may differ) |
| Free vs paid | Homepage: “Start free in June 2026”, “No credit card required”; `/pricing`: “Free access in June 2026!” + “Sign in to subscribe” on paid tiers |
| Locale | EN primary; demo player shows Ukrainian `-10 сек` / `+10 сек` on EN homepage |
| Platform | React SPA (Cloudflare); Stripe on pricing |
| SEO / crawl | `sitemap.xml` returns **500**; `robots.txt` **Disallow** `/login` and `/register` while marketing links to them |
| Social proof | New **15 on-site testimonials** with CEFR level deltas (e.g. B1 → B2); no third-party review corpus |

### Forum / social sentiment
**No dedicated public review corpus** found for Explys (English video EdTech) in App Store, Trustpilot, or Reddit at audit time. Search surfaces **Exply** (BI analytics, docs.exply.io), tutoring marketplaces (Preply, iTalki), and generic “best apps 2026” lists that omit Explys.

**Implication:** On-site testimonials partially address Explorer trust, but lack external validation; brand collision with “Exply” remains a discovery risk.

### Industry trends (2026)
- Digital English learning market expanding ~15–17% CAGR; shift toward **AI personalization** and **mobile-first** delivery ([GII Research 2026](https://www.giiresearch.com/report/tbrc1960554-digital-english-language-learning-global-market.html)).
- Category leaders (Duolingo, Babbel) emphasize **freemium scale**, **app store presence**, and **documented learner outcomes**; AI/video features are table stakes ([LingoBright 2026 stats](https://www.lingobright.com/statistics/language-learning-apps/)).
- Explys competes in **media-native self-study** (closest to ELSA “Media Learners”) rather than tutoring marketplaces.

---

## 2. Nielsen Heuristics

| # | Heuristic | Rating | Site-specific evidence |
|---|-----------|--------|------------------------|
| 1 | Visibility of system status | **Mixed** | Demo player shows `0:00/0:00`; promo “Start free in June 2026” vs tier prices creates time-bound ambiguity. **Interactive State Uniformity:** Primary CTAs use consistent pill styling; hero adds “No credit card required” microcopy. Focus/disabled/loading states not observable on marketing pages. `/catalog` unauthenticated shows login without explaining the gate. |
| 2 | Match between system and real world | **Mixed** | “Browse content” implies open catalog; live behavior is sign-in wall. `/login` and `/register` now resolve (fixed since June 2026 audit). |
| 3 | User control and freedom | **Good** | Footer links to About, Privacy, Terms, Feedback; pricing FAQ expandable; anchor links (#how-explys-works, #testimonials). |
| 4 | Consistency and standards | **Mixed** | EN homepage with Ukrainian `-10 сек` on demo controls; “Sign in to subscribe” on tier buttons vs “No credit card required” on hero; robots disallow URLs that marketing promotes. |
| 5 | Error prevention | **Mixed** | Registration collects password + confirm; Google OAuth on login/register. No preview of placement length before signup. |
| 6 | Recognition rather than recall | **Good** | Four-step “How Explys works”; tier feature bullets on homepage and `/pricing`; 15 testimonial cards with level progression. |
| 7 | Flexibility and efficiency | **Mixed** | Google OAuth. Teacher “Contact us” for enterprise—no self-serve demo scheduler. |
| 8 | Aesthetic and minimalist design | **Good** | Clean dark marketing aesthetic; scannable feature grid and differentiation block vs Lingopie/FluentU pain points. |
| 9 | Help users recognize, diagnose, recover from errors | **Weak** | `sitemap.xml` 500—no crawler recovery. Catalog gate offers login but not “why sign in first.” |
| 10 | Help and documentation | **Partial** | FAQ on homepage/pricing; About + Feedback; Telegram in footer. No header Help/Docs link. |

**Interactive State Uniformity (Heuristic #1 detail):** Hero CTAs (“Start for free”, “Browse content”) share visual weight; secondary CTA does not signal authentication requirement. Pricing tier buttons appear actionable; copy says sign-in required for paid tiers—risk of **false affordance** during free-promo period.

---

## 3. Usability Audit

### Informational Hierarchy
| Zone | High-intent anchors visible? | Issue |
|------|------------------------------|-------|
| Homepage hero | **Yes:** dual CTAs, social proof, “No credit card required” | Price below fold on homepage (Explorer-friendly); Fast Buyer must scroll to pricing strip |
| Homepage pricing strip | **Yes:** $7 / $12 / $19 + “Most popular” + June 2026 promo | Tier CTAs vs “Sign in to subscribe” on `/pricing` |
| `/pricing` | **Yes:** tier matrix, FAQ, Stripe trust line | Teacher row “Custom / Enterprise” without price anchor |
| `/catalog` (unauth) | **No:** login form replaces expected catalog | **Critical:** “Browse content” breaks at first click |

**Verdict:** Marketing hierarchy serves **Explorer** (story → differentiation → testimonials → steps) well. **Fast Buyer** gets pricing on homepage but still hits auth gate on browse. Secondary CTA hierarchy breaks at catalog login wall.

### De-duplication of Navigation
| Element | Occurrences | Recommendation |
|---------|-------------|----------------|
| “Start for free” / “Get started” | Hero, CTA section, pricing strip, footer | Acceptable if one primary per viewport; audit scroll depth |
| Pricing summary | Homepage mid-page + `/pricing` + footer “Pricing” | Teaser + full page OK if copy identical |
| Login / register | Header, footer, auth pages | Canonical `/login`, `/register` — good |
| FAQ content | Homepage accordion + pricing FAQ | Partial overlap—merge or cross-link once |
| Testimonials | 15 cards on homepage | High scroll cost on mobile—consider carousel with 3 featured + link |

**Count:** ~3 parallel signup paths (hero, bottom CTA, pricing); legacy URL issues largely resolved.

### Additional UX laws

**Hick’s Law:** Four B2C tiers + Teacher row on first pricing view. “Most popular” on Smart helps.

**Jakob’s Law:** `/login` and `/register` now match conventions (improved since June 2026).

**Peak–end rule:** Homepage ends with strong CTA + testimonials—positive peak. Unauthenticated `/catalog` after “Browse content” is likely **negative peak**.

**Fitts’s Law:** Full-width hero buttons on mobile—good target size.

**Miller’s Law:** 15 testimonials exceed working-memory scan—group or paginate.

---

## 4. Competitive Analysis

### Named competitors
1. **Duolingo** — [duolingo.com](https://www.duolingo.com) — freemium gamified scale, app-first  
2. **Babbel** — [babbel.com/prices](https://www.babbel.com/prices) — structured subscription courses  
3. **ELSA Speak** — [elsaspeak.com](https://elsaspeak.com/en) — AI speaking + media learners segment  

Explys is closest to **ELSA / media-native** positioning (video/listening) rather than Duolingo drills.

### Feature comparison

| Capability | Explys | Duolingo | Babbel | ELSA Speak |
|------------|---------|----------|--------|------------|
| Video/movie-based lessons | **Core** (500+ videos claimed) | Limited (Max features) | Some video | Media learner persona |
| Placement / level test | Yes (step 2) | Yes | Yes | Yes |
| In-content quizzes | Yes (step 4) | Yes | Yes | Speaking focus |
| Free start | “Start free in June 2026”; no card on hero | Strong freemium | Trial/subscription | Free tier |
| App store presence | Not on marketing site | Prominent | Prominent | 90M+ learners cited |
| Social proof | 15 on-site testimonials + 3315 users | Mass scale | Millions of ratings | External testimonials |
| Family plan | $19/mo, 3 profiles | Super Family | Group plans | Individual focus |
| Teacher / school LMS | Teacher tier + dashboard features | Duolingo for Schools | Enterprise | ELSA Schools/Business |
| Public pricing | $7 / $12 / $19 + custom | Freemium + Super | Subscription tiers | Free + B2B |
| Browse without account | **No** (`/catalog` → login) | Partial preview | Marketing + trial | Marketing + app |
| vs Lingopie/FluentU | Transparent pricing, no card to start, context-aware subtitles (claimed) | — | — | — |

**Explys differentiation:** Video catalog + comprehension loop + AI learning plan + new competitive differentiation block. **Gap vs leaders:** app distribution, third-party reviews, pre-auth content sampling.

---

## 5. Google Analytics (Simulated)

*Simulated until GA4/PostHog production dashboards are confirmed. Instrumentation recommendations included.*

### Assumed traffic mix
| Channel | Share | Notes |
|---------|-------|-------|
| Organic search | 35% | Risk from `sitemap.xml` 500, robots disallow auth URLs |
| Direct / brand | 25% | Exply vs Exply BI confusion |
| Paid social | 20% | Landing on homepage; track CTA variant |
| Referral (Telegram, teachers) | 15% | Footer/About Telegram |
| Other | 5% | |

### Funnel (monthly, illustrative 10k sessions)
| Step | Users | Conv. | Drop-off signal |
|------|-------|-------|-----------------|
| Homepage view | 10,000 | — | |
| CTA click (any) | 2,400 | 24% | Browse vs Start split |
| Registration start | 1,200 | 50% of clicks | `/register` |
| Registration complete | 720 | 60% | Multi-step wizard |
| First catalog open | 720 | 100% | Gated |
| Placement complete | 504 | 70% | In-app |
| First lesson complete | 302 | 60% | In-app |
| Paid subscribe | 45 | 15% of activated | Post–June 2026 promo |

### Events to instrument (P0)
- `landing_cta_primary_click` {source: hero | bottom | pricing}
- `landing_cta_secondary_click` {source: hero | bottom}
- `landing_hero_video_play`
- `landing_pricing_plan_click` {planId}
- `auth_gate_hit` {from_url: /catalog}
- `registration_step` {step: 1|2|3}
- `placement_started` / `placement_completed`
- `lesson_started` / `lesson_completed` / `quiz_submitted`
- `checkout_started` / `checkout_success`

---

## 6. Research Hypotheses

1. **H1:** Users who click “Browse content” before registering abandon at higher rates than “Start for free” because `/catalog` shows login without sample clips.  
   *Metric:* Gate bounce rate by referrer CTA.

2. **H2:** June 2026 free-promo messaging reduces paid conversion clarity when promo ends.  
   *Metric:* Pricing page → checkout start; survey trust score.

3. **H3:** Adding placement duration (“~5–10 min”) to Step 02 increases signup completion for Fast Buyers.  
   *Metric:* Registration complete rate with/without duration copy.

4. **H4:** 15 testimonials improve Explorer trust vs June audit (0 external reviews), but mobile scroll depth drops.  
   *Metric:* Scroll to testimonials; signup rate vs control without section.

5. **H5:** Lack of app store badges reduces mobile signup vs competitors.  
   *Metric:* Mobile registration rate after adding store CTAs.

---

## 7. Interviews Testing Plan

### Participant segments (n=6–8 per round)
| Segment | Criteria | Focus |
|---------|----------|-------|
| A1 | Adult learner, 15 min/day, job-related English | Fast Buyer path, pricing, placement |
| A2 | Student 16–22, consumes English media | Explorer path, testimonials, content taste |
| A3 | Parent considering Family tier | Profiles, controls, price |
| A4 | Private English teacher, 10–40 students | Teacher tier, LMS features |
| A5 | Returning user lapsed 30+ days | Re-entry, learning plan |
| B1 | Ukrainian locale preference | Language toggle, `-10 сек` inconsistency |
| B2 | Mobile-only user | Registration + first lesson on phone |

### 60-minute session flow
1. Context questions (5 min)  
2. Homepage think-aloud → first CTA (10 min)  
3. Task: “Find a lesson that matches your interests without creating an account” (observe reaction) (5 min)  
4. Registration + placement (15 min)  
5. First lesson + quiz (15 min)  
6. Pricing comprehension (5 min)  
7. Debrief + SUS (5 min)

### Card-sorting protocol
- **Closed sort:** Homepage sections (Hero, Why choose, Differentiation, How it works, Testimonials, Pricing, FAQ)—optimal order for “deciding to try Explys.”  
- **Open sort:** 12 feature cards into “Must have before signup” / “Nice later” / “Don’t care.”

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
- “I trust the price shown matches what I will pay after June 2026.”  
- “I could find content that matches my interests easily.”  
- “The signup process felt appropriately short.”  
- “I would recommend Explys to a colleague.” (NPS follow-up)

### Open text
- “What almost stopped you from signing up?”  
- “What did you expect ‘Browse content’ to do?”

### Optional card-sort validation (remote)
Mirror interview card sort via OptimalSort; n≥30 for Fast Buyer vs Explorer segments.

---

## 9. Insights Mapping

| Cluster | Findings | Impact | Action |
|---------|----------|--------|--------|
| **Gate mismatch** | `/catalog` → login; “Browse content” breaks promise | High abandonment at exploration CTA | Public catalog teaser (3 clips) or rename CTA |
| **Promo clarity** | “Start free in June 2026” + tier prices | Conversion cliff when promo ends | Single promo module with post-promo pricing |
| **Social proof** | 15 testimonials added; still no external reviews | Explorer trust improved vs June | Add 2–3 verifiable names/links or video quotes |
| **Locale quality** | `-10 сек` on EN homepage demo | Trust for EN-first users | Fix i18n on demo widget |
| **SEO** | `sitemap.xml` 500; robots disallow `/login` `/register` | Organic + crawl issues | Fix sitemap; allow canonical auth URLs |
| **B2B path** | Teacher tier + “Contact us” | Medium pipeline quality | `/for-teachers` landing + calendar embed |
| **Competitive parity** | Differentiation block vs Lingopie/FluentU | Strong messaging | Pair with sample clip proof |
| **Mobile acquisition** | No app store CTAs | Mobile gap | Add badges when apps live |

---

## 10. Persona & JTBD

**Persona A (Fast Buyer):** Olena, 29, marketing coordinator in Kyiv, 20 min/day on phone. Needs **price**, **free start without card**, and **time to first lesson**. Frustrated by login walls and unclear post–June 2026 pricing. Needs pricing strip + “No credit card required” (now on hero—good) and placement duration.

**Persona B (Explorer):** Marco, 22, film student in Milan, learns English through series. Needs **proof of content taste** and **peer stories** before price. New testimonials help; still needs sample clip browse without account. Abandons if “Browse content” hits login without trailer.

**JTBD:** “When I want English that fits how I actually consume media, I want lessons built around videos I enjoy and quizzes that prove I understood, so I can improve listening and vocabulary without a boring textbook app.”

---

## 11. HMW & Crazy 8

### HMW (from top pain points)
1. HMW let Explorers **taste the catalog** before creating an account?  
2. HMW make **June 2026 free → paid transition** obvious at every CTA?  
3. HMW reduce **scroll fatigue** from 15 testimonials without losing social proof?

### Crazy 8 — HMW #1 (public catalog taste)
1. Homepage embed: 60s featured clip with 2 quiz questions (no account).  
2. “Preview mode” on `/catalog`: 5 public trailers; rest blurred.  
3. Genre row on landing with 1 free episode each.  
4. Interactive quiz on existing hero demo video.  
5. Magic link to one full lesson (email only).  
6. Teacher-shared public assignment links.  
7. “Try placement preview” — 3 questions without account.  
8. Sticky mini-player across marketing pages until signup.

---

## 12. Prioritization Mapping

| Initiative | Impact | Effort | Priority |
|------------|--------|--------|----------|
| Align “Browse content” with behavior (teaser or rename) | High | Medium | **P0** |
| Unify June 2026 promo + post-promo pricing messaging | High | Low | **P0** |
| Fix `sitemap.xml` 500 | Medium | Low | **P0** |
| Public sample lesson / video row on homepage | High | Medium | **P1** |
| Fix homepage demo locale (`-10 сек`) | Medium | Low | **P1** |
| Add placement duration to Step 02 copy | Medium | Low | **P1** |
| Testimonials: feature 3 + “read more” | Medium | Low | **P1** |
| `/for-teachers` B2B landing + Calendly | Medium | Medium | **P2** |
| App store CTAs when available | Medium | Medium | **P2** |
| Fix robots.txt disallow on `/login` `/register` | Medium | Low | **P2** |
| External review collection (Trustpilot) | Medium | High | **P2** |

---

## 13. Customer Journey Map

| Stage | Actions | Touchpoints | Pain | Opportunity | Emotional / Transactional note |
|-------|---------|-------------|------|-------------|-------------------------------|
| **Awareness** | Search “learn English with movies” | Google, social | Exply BI name collision | Clarify “movies & series” in meta/ads | **Emotional:** hero + differentiation block |
| **Consideration** | Read features, testimonials, How it works | Homepage sections | No App Store proof | Testimonials + demo video | **Emotional** before pricing strip |
| **Intent** | Click “Browse content” or “Start for free” | Hero CTAs | Browse → login shock | Teaser or honest CTA label | **Transactional break** on browse |
| **Signup** | `/register`, Google OAuth | Auth forms | Multi-step wizard | Progress indicator | Welcome copy emotional; fields transactional |
| **Onboarding** | Placement + learning plan | Post-login catalog | Length unknown pre-signup | State duration in Step 02 | Transactional dominates |
| **First value** | Watch lesson + quiz | Lesson player | Not verifiable publicly | Instrument time-to-first-quiz | Target **peak:** quiz win |
| **Conversion** | Choose tier post-promo | `/pricing`, `/subscribe` | Promo end confusion | Countdown + tier anchor | Transactional — trust critical |
| **Retention** | Learning plan, streak | App shell | — | Email streak reminders | EDU-06 gamification preview |

**Emotional vs transactional balance:** Homepage earns Explorer engagement (video metaphor, differentiation, testimonials) before pricing—appropriate. **Gap:** secondary CTA triggers transactional gate too early without sampling.

---

## 14. Information Architecture

### Observed public sitemap (ASCII)
```text
explys.com/
├── / (landing: hero, pricing strip, features, differentiation, how, testimonials, FAQ, CTA)
├── /pricing
├── /about
├── /feedback
├── /privacy
├── /terms
├── /login              ← working (200)
├── /register           ← working (200)
├── /catalog            ← unauthenticated → login
├── /learning-plan      ← unauthenticated → login
└── /sitemap.xml        ← 500
```

### Recommended sitemap
```text
explys.com/
├── / (marketing)
├── /pricing
├── /sample             ← 1–3 public preview lessons (NEW)
├── /for-teachers       ← B2B landing (NEW)
├── /about | /feedback | /legal/*
├── /login | /register  ← canonical auth (allow in robots.txt)
└── app (authenticated)
    ├── /catalog
    ├── /learning-plan
    └── /content/:id
```

### Scalable modular blocks
| Block | Reuse |
|-------|-------|
| Hero + dual CTA + social proof + trust microcopy | All landing variants |
| Pricing strip + June promo module | Home, retargeting |
| Differentiation vs competitors | Home, ads |
| 4-step “How it works” | Home, teacher page |
| Testimonials carousel | Home, `/sample` |
| Tier comparison table | Home teaser + `/pricing` full |
| FAQ accordion | Pricing objections |
| Sample video + micro-quiz | Home, `/sample` |
| Trust strip | Stripe, terms, privacy |
| Sticky mobile CTA | “Start for free” after 40% scroll |

---

## 15. Rapid Testing Params

### Five-second test (n=20)
**Stimulus:** Homepage above-fold screenshot (desktop + mobile).  
**Question:** “What does this product do, and what would you click first?”  
**Pass criteria:** ≥70% mention video/movies/English; ≥50% identify primary CTA; ≤10% say “unclear.”

### Hallway test (n=5, 10 min each)
**Tasks:**
1. Find monthly price for one person.  
2. Explain what happens after you create an account.  
3. Browse a lesson without signing up.  

**Pass criteria:** Task 1 ≥80% success ≤60s; Task 2 ≥60% mention placement/plan; Task 3 **expected fail today**—document frustration for P0 case.

---

## 16. Design Handoff

### Design
- [ ] Redesign hero secondary CTA label or add public sample module  
- [ ] Promo module: “Free through June 2026 → then from $7/mo”  
- [ ] Fix demo player i18n; EN controls on EN homepage  
- [ ] Testimonials: 3 featured + expand  
- [ ] Teacher page wireframe + dashboard screenshots  
- [ ] App store badge row (when live)

### Engineering
- [ ] Fix `sitemap.xml` 500  
- [ ] Update `robots.txt` — allow `/login`, `/register`  
- [ ] PostHog events per §5 (landing analytics partially wired in codebase)  
- [ ] Public read-only catalog endpoint or `/sample` pages  
- [ ] Public stats endpoint (remove admin fetch from hero — see CODE_REVIEW.md S1)

### Stakeholder
- [ ] Align promo policy: free through June 2026 vs tier launch  
- [ ] Approve public sample content licensing  
- [ ] Testimonial verification policy (usernames only vs full names)  
- [ ] Teacher sales routing (email vs calendar)

### Release acceptance criteria
- “Browse content” behavior matches label OR label updated  
- Homepage promo language consistent with `/pricing`  
- Five-second test ≥70% on value prop  
- `sitemap.xml` returns 200 valid XML  
- Demo player shows EN controls on EN locale

---

## 17. Industry Playbook

**Classification:** edtech-language-learning (primary) | b2b-saas (secondary — Teacher LMS tier) | **Confidence:** **High** — see `~/.cursor/skills/ux-research-pipeline/industries/sites/explys.com.md`

| Tactic | Do this | Typical uplift | Source | Site status | Evidence on explys.com |
|--------|---------|----------------|--------|-------------|------------------------|
| EDU-08 | Sample genres + browse path on homepage | ~5–12% Explorer conversion | Content-based EdTech marketing tests | **Gap** | “Browse content” → `/catalog` shows **login**, not clips |
| EDU-01 | “Start free” above fold; no credit card | ~15–30% signup completion | PLG / EdTech onboarding benchmarks | **Partial** | “Start for free” + “No credit card required” on hero; tier buttons still “Sign in to subscribe” |
| EDU-02 | Placement explained + duration on homepage | ~10–20% activation after signup | Duolingo/Babbel-style onboarding research | **Partial** | Step 02 describes placement; **no duration** stated |
| EDU-04 | Scannable tiers; “most popular” badge | ~5–12% paid conversion | Baymard-style plan comparison (adapted subscriptions) | **Met** | Light/Smart/Family/Teacher; **“Most popular”** on Smart |
| EDU-12 | Stripe/trust copy + terms near plans | ~3–6% checkout completion | Subscription trust patterns | **Met** | Stripe + terms copy on `/pricing` |
| EDU-03 | Learning plan visibility before paywall | ~8–15% week-1 retention | Learning science — goal visibility | **Partial** | Step 03 describes plan; full plan post-login only |
| EDU-05 | Video + quiz while clip fresh | ~10–18% lesson completion | MOOC/video-course UX studies | **Partial** | Step 04 describes loop; not observable without account |
| EDU-09 | Learner vs teacher + Teacher sales CTA | ~10–20% B2B pipeline quality | B2B EdTech funnel benchmarks | **Partial** | Teacher tier + “Contact us”; no `/for-teachers` page |
| EDU-06 | Gamification preview on marketing | ~5–10% DAU | Gamified learning engagement literature | **Partial** | “Gamified progress” bullet; no streak/XP preview |
| EDU-07 | Analytics promise on mid tier | ~4–8% upgrade to mid tier | Subscription upsell patterns | **Partial** | Smart lists “Deep progress analytics”; no dashboard sample |
| EDU-10 | Family plan benefits visible | ~3–8% ARPU (family attach) | Consumer subscription family plans | **Met** | 3 profiles, parental controls, tournaments |
| EDU-11 | Mobile ergonomics; app links | ~8–15% mobile completion | Mobile learning UX composite | **Gap** | No App Store / Play CTAs on marketing pages |
| SaaS-02 | Demo vs trial split for enterprise | ~8–15% lead quality | Gartner / PLG benchmarks | **Partial** | Learner self-serve vs Teacher “Contact us”; no calendar |
| SaaS-06 | Feature comparison table | ~5–12% paid conversion | Baymard-style comparison (adapted B2B) | **Partial** | Tier bullets yes; no full checkmark matrix |
| SaaS-08 | Docs link in header | ~3–7% trial retention | SaaS support deflection metrics | **Gap** | No Help/Docs in header; Feedback only |
| SaaS-03 | Security/compliance strip (enterprise) | ~5–10% enterprise trust | B2B buyer surveys | **Gap** | Teacher tier lacks SOC2/GDPR/SSO strip |

**Top 3 playbook-backed P0 actions (cross-link §12):**
1. **EDU-08 — Public content taste:** Fix Browse CTA or add sample clips (§12 P0).  
2. **EDU-01 + promo clarity:** Single “Free through June 2026, no card” module aligned with tier pricing (§12 P0).  
3. **EDU-02 — Placement duration:** Add “~5–10 min” to Step 02 + fix sitemap (§12 P0/P1).

---

*Sources:* https://explys.com/ · https://explys.com/pricing · https://explys.com/about · https://explys.com/login · https://explys.com/register · https://explys.com/catalog · https://explys.com/learning-plan · https://explys.com/robots.txt · https://explys.com/sitemap.xml · https://www.duolingo.com · https://www.babbel.com/prices · https://elsaspeak.com/en · https://www.lingobright.com/statistics/language-learning-apps/ · https://www.giiresearch.com/report/tbrc1960554-digital-english-language-learning-global-market.html · Site instructions: `~/.cursor/skills/ux-research-pipeline/industries/sites/explys.com.md` · **Fetch date:** 2026-07-02
