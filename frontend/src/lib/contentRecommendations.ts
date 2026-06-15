/**
 * Catalog video recommendations (GET /content-recommendations/for-user/:id).
 */

import { apiFetch } from "./api";
import type { CatalogCardVideo } from "../components/catalog/CatalogVideoCard";
import type { UserData } from "../context/UserContext";
import { parseStudyingPlanPhases } from "./learningPlan";

export type VideoRecommendationItem = {
  rank: number;
  score: number;
  contentVideo: {
    id: number;
    videoName: string;
    videoLink: string;
    ageRestriction?: string;
  };
  content: {
    name: string;
  };
  stats?: {
    systemTags?: string[];
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
  ageRestriction?: string;
  content: {
    category: { name: string };
    stats?: {
      systemTags?: string[];
      userTags?: string[];
    } | null;
  };
};

export type ClientRecommendationOptions = {
  /** Canonical genre names for favorite/hated ids when known (e.g. from GET /genres). */
  favoriteGenreNames?: string[];
  hatedGenreNames?: string[];
};

function tokenSet(values: string[]): Set<string> {
  const out = new Set<string>();
  for (const raw of values) {
    const t = raw.trim().toLowerCase();
    if (t.length > 0) {
      out.add(t);
    }
  }
  return out;
}

function tagOverlapScore(tags: string[], tokens: Set<string>): number {
  if (tokens.size === 0 || tags.length === 0) {
    return 0;
  }
  let hits = 0;
  for (const raw of tags) {
    const t = raw.trim().toLowerCase();
    if (!t) {
      continue;
    }
    if (tokens.has(t)) {
      hits += 1;
      continue;
    }
    for (const token of tokens) {
      if (t.length > 2 && (t.includes(token) || token.includes(t))) {
        hits += 0.65;
        break;
      }
    }
  }
  return Math.min(1, hits / tags.length);
}

/**
 * Active phase catalogue topic names from stored plan or server-provided phase topics.
 */
export function resolveActivePhaseTopicNames(user: UserData | null): string[] {
  if (!user) {
    return [];
  }
  const phaseIndex = Math.max(0, user.activeStudyingPhaseIndex ?? 0);
  const fromServer = user.studyingPlanPhaseTopics?.[phaseIndex];
  if (fromServer && fromServer.length > 0) {
    return fromServer.map((t) => t.name);
  }
  const phases = parseStudyingPlanPhases(user.studyingPlanPhases);
  const topics = phases?.[phaseIndex]?.topics;
  if (!topics || topics.length === 0) {
    return [];
  }
  return topics.map((t) => t.name);
}

/**
 * Fetches ranked recommendations for a learner.
 */
export async function fetchContentRecommendations(
  userId: number,
): Promise<ContentRecommendationsResponse | null> {
  try {
    const res = await apiFetch(`/content-recommendations/for-user/${userId}`, {
      method: "GET",
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as ContentRecommendationsResponse;
  } catch {
    return null;
  }
}

/**
 * Maps API recommendation rows to catalog cards, enriching thumbnails and age restrictions from the library list.
 */
export function mapRecommendationsToCatalogCards(
  items: VideoRecommendationItem[],
  thumbnailById: ReadonlyMap<number, string | undefined>,
  limit = 12,
  ageRestrictionById?: ReadonlyMap<number, string | undefined>,
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
      ageRestriction: ageRestrictionById?.has(id)
        ? ageRestrictionById.get(id)
        : item.contentVideo.ageRestriction,
      level: item.stats?.systemTags?.find((tag) =>
        /^(A1|A2|B1|B2|C1|C2)$/i.test(tag),
      ),
    });
  }
  return out;
}

/**
 * Client-side fallback when the recommendations API is unavailable.
 * Mirrors a subset of backend rules: CEFR, phase topics, hobbies/work, optional genres.
 */
export function buildClientRecommendedVideos(
  videos: CatalogVideoLike[],
  user: UserData | null,
  limit = 12,
  options?: ClientRecommendationOptions,
): CatalogCardVideo[] {
  if (videos.length === 0) {
    return [];
  }

  const level = user?.englishLevel?.trim();
  const phaseTopicNames = resolveActivePhaseTopicNames(user);
  const phaseTokens = tokenSet(phaseTopicNames);
  const profileTokens = tokenSet([
    ...(user?.hobbies ?? []),
    user?.workField ?? "",
    user?.education ?? "",
  ]);
  const favoriteGenreTokens = tokenSet(options?.favoriteGenreNames ?? []);
  const hatedGenreTokens = tokenSet(options?.hatedGenreNames ?? []);

  const scored = videos.map((v) => {
    let score = 0;
    const systemTags = v.content.stats?.systemTags ?? [];
    const userTags = v.content.stats?.userTags ?? [];
    if (level && systemTags.includes(level)) {
      score += 5;
    }
    if (phaseTokens.size > 0) {
      score += tagOverlapScore(userTags, phaseTokens) * 6;
      for (const name of phaseTopicNames) {
        const n = name.trim().toLowerCase();
        if (n.length > 2 && v.videoName.toLowerCase().includes(n)) {
          score += 1;
          break;
        }
      }
    }
    score += tagOverlapScore(userTags, profileTokens) * 3;
    if (favoriteGenreTokens.size > 0) {
      score += tagOverlapScore(userTags, favoriteGenreTokens) * 2;
    }
    if (hatedGenreTokens.size > 0) {
      const hatedHit = tagOverlapScore(userTags, hatedGenreTokens);
      if (hatedHit > 0) {
        score -= Math.ceil(hatedHit * 4);
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
    ageRestriction: v.ageRestriction,
    level: v.content.stats?.systemTags?.find((t) =>
      /^(A1|A2|B1|B2|C1|C2)$/i.test(t),
    ),
  }));
}
