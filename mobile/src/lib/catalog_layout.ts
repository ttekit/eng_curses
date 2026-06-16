import type { CatalogCardVideo } from "../components/CatalogVideoCard";

export type CatalogContentVideo = {
  id: number;
  videoName: string;
  videoDescription?: string | null;
  thumbnailUrl?: string;
  videoLink: string;
  ageRestriction?: string;
  playlistPosition?: number;
  content: {
    id: number;
    playlistPosition?: number;
    category: {
      name: string;
      description?: string;
      friendlyLink?: string;
    };
    stats?: {
      systemTags?: string[];
    } | null;
  };
};

export type CatalogHeroVideo = {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  thumbnailUrl?: string;
};

type CatalogRow = {
  title: string;
  description?: string;
  videos: CatalogCardVideo[];
};

export function to_card_video(video: CatalogContentVideo): CatalogCardVideo {
  const levelTag = video.content.stats?.systemTags?.find((tag) =>
    /^(A1|A2|B1|B2|C1|C2)$/i.test(tag.trim()),
  );
  return {
    id: video.id,
    title: video.videoName,
    categoryLabel: video.content.category.name,
    thumbnailUrl: video.thumbnailUrl,
    videoLink: video.videoLink,
    ageRestriction: video.ageRestriction,
    level: levelTag?.trim().toUpperCase(),
    contentId: video.content.id,
  };
}

export function pick_featured_hero(
  videos: readonly CatalogContentVideo[],
): CatalogHeroVideo | null {
  const featured = videos[0];
  if (!featured) {
    return null;
  }
  return {
    id: featured.id,
    title: featured.videoName,
    description:
      featured.videoDescription ??
      featured.content.category.description ??
      "",
    categoryName: featured.content.category.name,
    thumbnailUrl: featured.thumbnailUrl,
  };
}

export function build_catalog_rows(videos: readonly CatalogContentVideo[]): CatalogRow[] {
  if (videos.length === 0) {
    return [];
  }
  const byCategory = new Map<string, CatalogContentVideo[]>();
  for (const video of videos) {
    const key = video.content.category.name;
    const bucket = byCategory.get(key);
    if (bucket) {
      bucket.push(video);
    } else {
      byCategory.set(key, [video]);
    }
  }
  return [...byCategory.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([title, list]) => {
      const sorted = [...list].sort((left, right) => {
        const leftContentPos =
          typeof left.content.playlistPosition === "number"
            ? left.content.playlistPosition
            : 0;
        const rightContentPos =
          typeof right.content.playlistPosition === "number"
            ? right.content.playlistPosition
            : 0;
        if (leftContentPos !== rightContentPos) {
          return leftContentPos - rightContentPos;
        }
        const leftVideoPos =
          typeof left.playlistPosition === "number" ? left.playlistPosition : 0;
        const rightVideoPos =
          typeof right.playlistPosition === "number" ? right.playlistPosition : 0;
        if (leftVideoPos !== rightVideoPos) {
          return leftVideoPos - rightVideoPos;
        }
        return left.id - right.id;
      });
      return {
        title,
        videos: sorted.map(to_card_video),
      };
    });
}
