import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { generateContentVideoIframe } from "src/common/content-video-iframe.util";
import { PrismaService } from "src/prisma.service";
import { CreateContentVideoDto } from "./dto/create-content-video.dto";
import { UpdateContentVideoDto } from "./dto/update-content-video.dto";
import type { RedisCatalogCacheClient } from "src/redis/in-memory-redis.client";

export function compareContentVideosPlaylistOrder(
  a: {
    id: number;
    playlistPosition: number;
    content: { categoryId: number; playlistPosition: number };
  },
  b: {
    id: number;
    playlistPosition: number;
    content: { categoryId: number; playlistPosition: number };
  },
): number {
  const bySeries = a.content.categoryId - b.content.categoryId;
  if (bySeries !== 0) return bySeries;
  const byMedia = a.content.playlistPosition - b.content.playlistPosition;
  if (byMedia !== 0) return byMedia;
  const byVideo = a.playlistPosition - b.playlistPosition;
  if (byVideo !== 0) return byVideo;
  return a.id - b.id;
}

export const CATALOG_CONTENT_VISIBILITY_PUBLIC = "public" as const;


@Injectable()
export class ContentVideoService {
  constructor(
    private prisma: PrismaService,
    @Inject("REDIS_CLIENT") private readonly redis: RedisCatalogCacheClient,
  ) {}

  async create(createContentVideoDto: CreateContentVideoDto) {
    const maxRow = await this.prisma.contentVideo.aggregate({
      where: { contentId: createContentVideoDto.contentId },
      _max: { playlistPosition: true },
    });
    const playlistPosition = (maxRow._max.playlistPosition ?? -1) + 1;
    const newVideo = await this.prisma.contentVideo.create({
      data: { ...createContentVideoDto, playlistPosition },
    });
    await this.redis.del("catalog:videos");
    return newVideo;
  }

  async findAll(userId?: number) {
    let teacherId: number | undefined = undefined;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { teacherId: true },
      });
      if (user?.teacherId) {
        teacherId = user.teacherId;
      }
    }

    const cacheKey = teacherId
      ? `catalog:videos:teacher:${teacherId}`
      : "catalog:videos";

    const cachedVideos = await this.redis.get(cacheKey);
    if (cachedVideos) {
      return JSON.parse(cachedVideos);
    }

    const videos = await this.prisma.contentVideo.findMany({
      where: {
        OR: [
          {
            content: {
              category: { visibility: CATALOG_CONTENT_VISIBILITY_PUBLIC },
            },
          },
          ...(teacherId
            ? [
                {
                  content: {
                    category: { ownerUserId: teacherId },
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: [
        { content: { categoryId: "asc" } },
        { content: { playlistPosition: "asc" } },
        { playlistPosition: "asc" },
        { id: "asc" },
      ],
      include: {
        videoCaption: {
          select: { subtitlesFileLink: true },
        },
        content: {
          include: {
            category: true,
            stats: {
              include: {
                topics: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    await this.redis.set(cacheKey, JSON.stringify(videos), "EX", 300);
    return videos;
  }

  async findWatchedByUser(userId: number) {
    const sessions = await this.prisma.watchSession.findMany({
      where: { userId },
      orderBy: { endedAt: "desc" },
      select: { contentVideoId: true },
    });

    const orderedIds: number[] = [];
    const seen = new Set<number>();
    for (const s of sessions) {
      if (seen.has(s.contentVideoId)) continue;
      seen.add(s.contentVideoId);
      orderedIds.push(s.contentVideoId);
    }

    if (orderedIds.length === 0) return [];

    const videos = await this.prisma.contentVideo.findMany({
      where: { id: { in: orderedIds } },
      include: {
        videoCaption: { select: { subtitlesFileLink: true } },
        content: {
          include: {
            category: true,
            stats: {
              include: { topics: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    return videos.sort(compareContentVideosPlaylistOrder);
  }

  async findOne(id: number, reqUserId?: number) {
    const contentVideo = await this.prisma.contentVideo.findUnique({
      where: { id },
      include: {
        videoCaption: { select: { subtitlesFileLink: true } },
        content: {
          include: {
            category: true,
            stats: {
              include: { topics: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!contentVideo) {
      throw new NotFoundException(`ContentVideo with ID ${id} not found`);
    }

    const now = new Date();
    const series = contentVideo.content.category;

    const isOwner = reqUserId && series.ownerUserId === reqUserId;
    const isPublic = series.visibility === "public";

    if (!isOwner && !isPublic) {
      if (series.availableFrom && series.availableFrom > now) {
        throw new ForbiddenException(
          "This lesson is locked and not yet available.",
        );
      }
      if (series.deadline && series.deadline < now) {
        throw new ForbiddenException(
          "The deadline for this lesson has passed.",
        );
      }
    }

    return contentVideo;
  }

  async getIframePayload(
    id: number,
    reqUserId?: number,
  ): Promise<{ iframeHtml: string }> {
    const v = await this.findOne(id, reqUserId);
    const iframeHtml = generateContentVideoIframe(v.videoLink, {
      title: v.videoName,
    });
    return { iframeHtml };
  }

  async update(id: number, updateContentVideoDto: UpdateContentVideoDto) {
    const contentVideo = await this.prisma.contentVideo.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!contentVideo) {
      throw new NotFoundException(`ContentVideo with ID ${id} not found`);
    }
    const updatedVideo = await this.prisma.contentVideo.update({
      where: { id },
      data: updateContentVideoDto,
    });
    await this.redis.del("catalog:videos");
    return updatedVideo;
  }

  async remove(id: number) {
    const contentVideo = await this.prisma.contentVideo.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!contentVideo) {
      throw new NotFoundException(`ContentVideo with ID ${id} not found`);
    }
    const deletedVideo = await this.prisma.contentVideo.delete({
      where: { id },
    });
    await this.redis.del("catalog:videos");
    return deletedVideo;
  }

}
