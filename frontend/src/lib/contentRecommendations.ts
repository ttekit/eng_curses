/**
 * Catalog video recommendations (GET /content-recommendations/for-user/:id).
 */

import { apiFetch } from "./api";
import type { CatalogCardVideo } from "../components/catalog/CatalogVideoCard";
import type { UserData } from "../context/UserContext";

export type VideoRecommendationItem = {
  rank: number;
  score: number;
  contentVideo: {
    id: number;
    videoName: string;
    videoLink: string;
  };
  content: {
    name: string;
  };
};

export type ContentRecommendationsResponse = {
  recommendations: VideoRecommendationItem[];
};

type CatalogVideoLike = {
  id: number;
  videoName: string;
  videoLink: string;
  thumbnailUrl?: string;
  content: {
    category: { name: string };
    stats?: {
      systemTags?: string[];
      userTags?: string[];
    } | null;
  };
};

/**
 * Fetches ranked recommendations for a learner.
 */
export async function fetchContentRecommendations(
  userId: number,
): Promise<ContentRecommendationsResponse | null> {
  try {
    const res = await apiFetch(
      `/content-recommendations/for-user/${userId}`,
      { method: "GET" },
    );
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as ContentRecommendationsResponse;
  } catch {
    return null;
  }
}

/**
 * Maps API recommendation rows to catalog cards, enriching thumbnails from the library list.
 */
export function mapRecommendationsToCatalogCards(
  items: VideoRecommendationItem[],
  thumbnailById: ReadonlyMap<number, string | undefined>,
  limit = 12,
): CatalogCardVideo[] {
  const out: CatalogCardVideo[] = [];
  for (const item of items) {
    if (out.length >= limit) break;
    const id = item.contentVideo.id;
    out.push({
      id,
      title: item.contentVideo.videoName,
      categoryLabel: item.content.name,
      videoLink: item.contentVideo.videoLink,
      thumbnailUrl: thumbnailById.get(id),
    });
  }
  return out;
}

/**
 * Client-side fallback when the recommendations API is unavailable.
 */
export function buildClientRecommendedVideos(
  videos: CatalogVideoLike[],
  user: UserData | null,
  limit = 12,
): CatalogCardVideo[] {
  if (videos.length === 0) {
    return [];
  }

  const level = user?.englishLevel?.trim();
  const hobbyTokens = new Set(
    (user?.hobbies ?? [])
      .map((h) => h.trim().toLowerCase())
      .filter((h) => h.length > 0),
  );

  const scored = videos.map((v) => {
    let score = 0;
    const systemTags = v.content.stats?.systemTags ?? [];
    if (level && systemTags.includes(level)) {
      score += 5;
    }
    for (const tag of v.content.stats?.userTags ?? []) {
      const t = tag.trim().toLowerCase();
      if (!t) continue;
      for (const hobby of hobbyTokens) {
        if (t.includes(hobby) || hobby.includes(t)) {
          score += 2;
          break;
        }
      }
    }
    return { v, score };
  });

  scored.sort((a, b) => b.score - a.score || a.v.id - b.v.id);
  const withSignal = scored.filter((row) => row.score > 0);
  const picked = (withSignal.length > 0 ? withSignal : scored).slice(0, limit);

  return picked.map(({ v }) => ({
    id: v.id,
    title: v.videoName,
    categoryLabel: v.content.category.name,
    thumbnailUrl: v.thumbnailUrl,
    videoLink: v.videoLink,
  }));
}
