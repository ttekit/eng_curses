/**
 * Post-build marketing SEO for `/` and `/pricing` without a headless browser.
 * Injects title, meta, canonical, hreflang, and JSON-LD into `dist/index.html`
 * so crawlers and social bots get route-specific head tags before JS runs.
 *
 * Works on Cloudflare Pages and other CI environments without Chrome libs.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const distDir = path.join(frontendRoot, "dist");

const siteOrigin = (process.env.VITE_SITE_URL ?? "https://explys.com").replace(/\/+$/, "");
const ogImage = `${siteOrigin}/og-image.png`;

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Explys",
    url: siteOrigin,
    logo: `${siteOrigin}/Icon.svg`,
    description:
      "Personalized English learning through adaptive video lessons, quizzes, and AI-assisted practice.",
  };
}

function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Explys",
    url: siteOrigin,
    description:
      "Learn English your way with adaptive video content and interactive lessons.",
    publisher: {
      "@type": "Organization",
      name: "Explys",
      url: siteOrigin,
      logo: `${siteOrigin}/Icon.svg`,
    },
  };
}

function buildPricingOfferCatalogJsonLd() {
  const offers = [
    {
      name: "Light (Essentials)",
      description: "For self-paced basic learning.",
      category: "Subscription",
    },
    {
      name: "Smart (Adaptive)",
      description: "A dynamic AI program that saves you time.",
      category: "Subscription",
    },
    {
      name: "Family (LMS/Pro)",
      description: "All the benefits of Smart for the whole family.",
      category: "Subscription",
    },
    {
      name: "Teacher (LMS Office)",
      description:
        "A tool for private teachers and schools (up to 40 students per class).",
      category: "Enterprise",
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Pricing",
    description:
      "Simple plans from essentials to adaptive AI and family options — plus Teacher / Enterprise for schools.",
    url: `${siteOrigin}/pricing`,
    itemListElement: offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      description: offer.description,
      url: `${siteOrigin}/pricing`,
      category: offer.category,
    })),
  };
}

function buildHreflangLinks(canonicalPath) {
  const normalized = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  const ukHref =
    normalized === "/" ? "/?lang=uk" : `${normalized}?lang=uk`;
  return [
    { hreflang: "en", href: `${siteOrigin}${normalized}` },
    { hreflang: "uk", href: `${siteOrigin}${ukHref}` },
    { hreflang: "x-default", href: `${siteOrigin}${normalized}` },
  ];
}

function buildSeoHeadBlock(config) {
  const {
    documentTitle,
    description,
    canonicalUrl,
    hreflangAlternates,
    jsonLdSchemas,
  } = config;

  const hreflangTags = hreflangAlternates
    .map(
      (alt) =>
        `  <link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(alt.href)}" />`,
    )
    .join("\n");

  const jsonLdTags = jsonLdSchemas
    .map(
      (schema) =>
        `  <script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    )
    .join("\n");

  return `  <!-- marketing-seo (post-build inject) -->
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta property="og:title" content="${escapeHtml(documentTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Explys" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:locale:alternate" content="uk_UA" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(documentTitle)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(documentTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
${hreflangTags}
${jsonLdTags}
  <title>${escapeHtml(documentTitle)}</title>`;
}

function applyMarketingSeo(html, config) {
  let next = html;
  next = next.replace(/<meta name="description"[\s\S]*?<\/meta>\s*/g, "");
  next = next.replace(/<meta name="robots"[\s\S]*?<\/meta>\s*/g, "");
  next = next.replace(/<meta property="og:[^"]+"[\s\S]*?<\/meta>\s*/g, "");
  next = next.replace(/<meta name="twitter:[^"]+"[\s\S]*?<\/meta>\s*/g, "");
  next = next.replace(/<link rel="canonical"[\s\S]*?\/?>\s*/g, "");
  next = next.replace(/<link rel="alternate" hreflang="[^"]+"[\s\S]*?\/?>\s*/g, "");
  next = next.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g,
    "",
  );
  next = next.replace(/<!-- marketing-seo[\s\S]*?-->\s*/g, "");
  next = next.replace(/<title>[\s\S]*?<\/title>\s*/g, "");

  const seoBlock = buildSeoHeadBlock(config);
  return next.replace("</head>", `${seoBlock}\n</head>`);
}

const homeConfig = {
  documentTitle: "Explys — Learn English with video lessons",
  description:
    "Learn English with interactive video lessons, subtitles, and AI-powered practice.",
  canonicalUrl: `${siteOrigin}/`,
  hreflangAlternates: buildHreflangLinks("/"),
  jsonLdSchemas: [buildOrganizationJsonLd(), buildWebSiteJsonLd()],
};

const pricingConfig = {
  documentTitle: "Pricing | Explys",
  description:
    "Simple plans from essentials to adaptive AI and family options — plus Teacher / Enterprise for schools.",
  canonicalUrl: `${siteOrigin}/pricing`,
  hreflangAlternates: buildHreflangLinks("/pricing"),
  jsonLdSchemas: [buildOrganizationJsonLd(), buildPricingOfferCatalogJsonLd()],
};

async function main() {
  const indexPath = path.join(distDir, "index.html");
  const baseHtml = await readFile(indexPath, "utf8");

  const homeHtml = applyMarketingSeo(baseHtml, homeConfig);
  await writeFile(indexPath, homeHtml, "utf8");
  console.log("[seo-inject] updated /");

  const pricingDir = path.join(distDir, "pricing");
  await mkdir(pricingDir, { recursive: true });
  const pricingHtml = applyMarketingSeo(baseHtml, pricingConfig);
  await writeFile(path.join(pricingDir, "index.html"), pricingHtml, "utf8");
  console.log("[seo-inject] wrote /pricing");
}

main().catch((error) => {
  console.error("[seo-inject] failed:", error);
  process.exit(1);
});
