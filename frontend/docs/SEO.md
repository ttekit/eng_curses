# Explys SEO operations checklist

Use this after deploying SEO changes to production.

## Google Search Console

1. Verify property ownership for `https://explys.com` (DNS TXT or HTML file).
2. Submit sitemap: `https://explys.com/sitemap.xml`
3. Monitor **Pages** → indexed vs. excluded (expect only `/` and `/pricing` under Path A).
4. Review **Core Web Vitals** and **Enhancements** → structured data (Organization, OfferCatalog).

## Rich results smoke test

- [Google Rich Results Test](https://search.google.com/test/rich-results): test `/` and `/pricing`
- Confirm title, description, and OG image without running JavaScript (post-`npm run build` SEO head injection)

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SITE_URL` | frontend | Canonical + OG absolute URLs |
| `VITE_TWITTER_SITE` | frontend | Optional `@site` handle |
| `PUBLIC_SITE_URL` | backend | Sitemap `<loc>` origin (defaults to `FRONTEND_URL`) |
| `SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG` | backend | Set `true` when Path B public lesson indexing is enabled |

## nginx (optional)

When using [`backend/nginx/explys-reverse-proxy.example.conf`](../backend/nginx/explys-reverse-proxy.example.conf), `/sitemap.xml` on `explys.com` proxies to Nest. Cloudflare/static deploys use `frontend/public/sitemap.xml` from the build.

## Analytics

Track organic landing → registration in your analytics tool (e.g. PostHog events on hero CTA from `utm_source=organic`).
