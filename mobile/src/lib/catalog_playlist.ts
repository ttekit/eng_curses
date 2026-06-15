/**
 * Helpers for `GET /contents/series/:friendlyLink`.
 */
type SeriesPlaylistEpisode = {
  index: number;
  contentVideoId: number;
  videoName: string;
  videoDescription: string | null;
  thumbnailUrl: string | null;
};

export type SeriesPlaylistPayload = {
  contentId: number;
  friendlyLink: string;
  name: string;
  description: string;
  episodes: SeriesPlaylistEpisode[];
};

type ApiContentVideo = {
  id?: number;
  videoName?: string;
  videoDescription?: string | null;
  thumbnailUrl?: string | null;
  playlistPosition?: number;
};

type ApiContentMedia = {
  id?: number;
  playlistPosition?: number;
  ContentVideo?: ApiContentVideo[];
};

type ApiSeriesBody = {
  id?: number;
  friendlyLink?: string;
  name?: string;
  description?: string;
  category?: ApiContentMedia[];
};

export function parse_series_playlist_payload(
  body: unknown,
): SeriesPlaylistPayload | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }
  const record = body as ApiSeriesBody;
  const contentId = typeof record.id === "number" ? record.id : null;
  const friendlyLink =
    typeof record.friendlyLink === "string" ? record.friendlyLink.trim() : "";
  if (contentId == null || !friendlyLink) {
    return null;
  }
  const slots = Array.isArray(record.category) ? record.category : [];
  const sortedSlots = [...slots].sort((left, right) => {
    const leftPos =
      typeof left.playlistPosition === "number" ? left.playlistPosition : 0;
    const rightPos =
      typeof right.playlistPosition === "number" ? right.playlistPosition : 0;
    return leftPos - rightPos;
  });
  const episodes: SeriesPlaylistEpisode[] = [];
  let index = 0;
  for (const slot of sortedSlots) {
    const videos = Array.isArray(slot.ContentVideo) ? slot.ContentVideo : [];
    for (const video of videos) {
      const videoId = typeof video.id === "number" ? video.id : null;
      if (videoId == null) {
        continue;
      }
      index += 1;
      episodes.push({
        index,
        contentVideoId: videoId,
        videoName:
          typeof video.videoName === "string" && video.videoName.trim()
            ? video.videoName
            : `Episode ${index}`,
        videoDescription:
          typeof video.videoDescription === "string" ? video.videoDescription : null,
        thumbnailUrl:
          typeof video.thumbnailUrl === "string" ? video.thumbnailUrl : null,
      });
    }
  }
  return {
    contentId,
    friendlyLink,
    name: typeof record.name === "string" ? record.name : "",
    description: typeof record.description === "string" ? record.description : "",
    episodes,
  };
}
