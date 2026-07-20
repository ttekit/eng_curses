# Explys SEO operations checklist

Use this after deploying SEO changes to production.

## Indexing policy (auth vs sitemap vs robots)

| Surface | In `sitemap.xml`? | `robots.txt` | HTML `robots` meta |
|---------|-------------------|--------------|--------------------|
| `/`, `/pricing`, `/about`, `/terms`, `/privacy` | **Yes** | Allowed (`Allow: /`) | `index, follow` |
| `/login`, `/register`, register-* | **No** | **Disallow** | `noindex` (`AuthPageSeo`) |
| `/catalog`, `/content/*`, app shells | **No** (until Path B) | **Disallow** | mostly `noindex` |
| AI agents | Use `/llms.txt` | Same as `User-agent: *` | — |

Rules of thumb:

1. **Sitemap** = only canonical, 200, indexable marketing URLs.
2. **Auth** = never in sitemap; Disallow + noindex (belt and suspenders).
3. **Do not** `Allow: /login` just because marketing CTAs link there — crawlers should not spend budget on thin forms.
4. **AI**: do not blanket-block GPTBot/ClaudeBot; publish curated [`/llms.txt`](../public/llms.txt) (llmstxt.org).

When enabling public lesson indexing (Path B), set `SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG=true` **and** remove matching `Disallow: /catalog` / `/content/` lines from `robots.txt`.

## Google Search Console

1. Verify property ownership for `https://explys.com` (DNS TXT or HTML file).
2. Submit sitemap: `https://explys.com/sitemap.xml`
3. Monitor **Pages** → indexed vs. excluded (expect marketing Path A URLs).
4. Confirm `https://explys.com/robots.txt` and `https://explys.com/llms.txt` return 200 after deploy.

## Rich results smoke test

- [Google Rich Results Test](https://search.google.com/test/rich-results): test `/` and `/pricing`
- **Homepage (`/`):** expect **FAQ** detected (`FAQPage` JSON-LD + visible `#faq` section)
- **Pricing (`/pricing`):** expect **FAQ**, **Breadcrumbs**, and **Product** snippets
- Organization / WebSite alone do **not** appear as rich results — that is normal

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SITE_URL` | frontend | Canonical + OG absolute URLs |
| `VITE_TWITTER_SITE` | frontend | Optional `@site` handle |
| `PUBLIC_SITE_URL` | backend | Sitemap `<loc>` origin (defaults to `FRONTEND_URL`) |
| `SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG` | backend | Set `true` when Path B public lesson indexing is enabled |

## nginx (optional)

When using [`backend/nginx/explys-reverse-proxy.example.conf`](../../backend/nginx/explys-reverse-proxy.example.conf), `/sitemap.xml` proxies to Nest. Static `frontend/public/robots.txt`, `llms.txt`, and fallback `sitemap.xml` ship with the SPA build.

## Analytics

Track organic landing → registration (e.g. PostHog on hero CTA with `utm_source=organic`).
