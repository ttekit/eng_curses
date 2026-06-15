import type { SEOProps } from "../components/SEO/SEO";
import { resolveCanonicalUrl } from "./siteUrl";
import { buildLessonVideoJsonLd } from "./seoStructuredData";

export type LessonSeoInput = {
  id: string | number;
  videoName: string;
  videoDescription?: string | null;
  thumbnailUrl?: string | null;
  videoLink?: string | null;
};

type LessonSeoProps = Pick<
  SEOProps,
  "title" | "description" | "canonicalUrl" | "noindex" | "jsonLd" | "ogType"
>;

/**
 * SEO metadata for authenticated lesson watch pages (always noindex).
 * Includes VideoObject + LearningResource JSON-LD for consistency with public lesson SEO.
 */
export function lessonSeo(input: LessonSeoInput): LessonSeoProps {
  const description =
    input.videoDescription?.trim() ||
    `${input.videoName} — English lesson on Explys.`;

  return {
    title: input.videoName,
    description,
    canonicalUrl: resolveCanonicalUrl(`/content/${input.id}`),
    noindex: true,
    ogType: "video.other",
    jsonLd: buildLessonVideoJsonLd({
      id: input.id,
      videoName: input.videoName,
      videoDescription: input.videoDescription,
      thumbnailUrl: input.thumbnailUrl,
      videoLink: input.videoLink,
    }),
  };
}
