/**
 * Validates that known public routes expose SEO metadata and private routes use noindex.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendSrc = path.resolve(__dirname, "../src");

const checks = [
  {
    file: "pages/landing/LandingPage.tsx",
    mustInclude: ["<SEO", "buildMarketingHreflangAlternates"],
    mustNotInclude: ["noindex"],
  },
  {
    file: "pages/pricing/PricingPage.tsx",
    mustInclude: ["<SEO", "buildMarketingHreflangAlternates", "buildPricingJsonLdSchemas"],
    mustNotInclude: ["noindex"],
  },
  {
    file: "pages/content/VideosPage.tsx",
    mustInclude: ["<SEO", "noindex"],
  },
  {
    file: "pages/content/ContentPage.tsx",
    mustInclude: ["<SEO", "noindex", "lessonSeo"],
  },
  {
    file: "pages/learning/LearningPlanPage.tsx",
    mustInclude: ["<SEO", "noindex"],
  },
  {
    file: "pages/login/LoginForm.tsx",
    mustInclude: ["AuthPageSeo"],
  },
];

let failed = false;

for (const check of checks) {
  const absolutePath = path.join(frontendSrc, check.file);
  const source = readFileSync(absolutePath, "utf8");
  for (const token of check.mustInclude ?? []) {
    if (!source.includes(token)) {
      console.error(`[seo-lint] ${check.file}: missing "${token}"`);
      failed = true;
    }
  }
  for (const token of check.mustNotInclude ?? []) {
    if (source.includes(token)) {
      console.error(`[seo-lint] ${check.file}: must not include "${token}"`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("[seo-lint] route SEO checks passed");
