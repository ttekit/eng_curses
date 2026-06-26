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
  ) { }

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
    await this.redis.del("catalog:videos:admin");
    return newVideo;
  }

  async findAll(userId?: number) {
    let teacherId: number | undefined = undefined;
    let isAdmin = false;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { teacherId: true, role: true },
      });
      if (user?.teacherId) {
        teacherId = user.teacherId;
      }
      if (user?.role === "ADMIN") {
        isAdmin = true;
      }
    }

    const cacheKey = isAdmin
      ? "catalog:videos:admin"
      : teacherId
        ? `catalog:videos:teacher:${teacherId}`
        : "catalog:videos";

    const cachedVideos = await this.redis.get(cacheKey);
    if (cachedVideos) {
      return JSON.parse(cachedVideos);
    }

    const whereClause = isAdmin
      ? {}
      : {
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
      };

    const videos = await this.prisma.contentVideo.findMany({
      where: whereClause,
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

  async findAllPublicCatalog() {
    const cacheKey = "catalog:videos:public_safe";
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const allPublicVideos = await this.findAll();

    const safeVideos = allPublicVideos.map((video: any) => {
      const { videoLink, ...safeData } = video;
      return safeData;
    });

    await this.redis.set(cacheKey, JSON.stringify(safeVideos), "EX", 300);
    return safeVideos;
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
            category: {
              include: { classAccesses: true },
            },
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

    if (!isOwner) {
      let isAssignedToClass = false;
      let applicableAvailableFrom = series.availableFrom;
      let applicableDeadline = series.deadline;

      if (reqUserId) {
        const user = await this.prisma.user.findUnique({
          where: { id: reqUserId },
          select: { classId: true },
        });

        if (user?.classId) {
          const classAccess = series.classAccesses.find(
            (ca) => ca.classId === user.classId,
          );
          if (classAccess) {
            isAssignedToClass = true;
            applicableAvailableFrom = classAccess.availableFrom;
            applicableDeadline = classAccess.deadline;
          }
        }
      }

      if (isAssignedToClass) {
        if (applicableAvailableFrom && applicableAvailableFrom > now) {
          throw new ForbiddenException(
            "This lesson is not yet available for your class.",
          );
        }
        if (applicableDeadline && applicableDeadline < now) {
          throw new ForbiddenException(
            "The deadline for this homework has expired.",
          );
        }
      } else if (!isPublic) {
        const hasClassRestrictions = series.classAccesses.length > 0;
        if (hasClassRestrictions) {
          throw new ForbiddenException(
            "You do not have access to this private lesson.",
          );
        }

        if (series.availableFrom && series.availableFrom > now) {
          throw new ForbiddenException("This lesson is not yet available.");
        }
        if (series.deadline && series.deadline < now) {
          throw new ForbiddenException(
            "The deadline for this lesson has expired.",
          );
        }
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
    await this.redis.del("catalog:videos:admin");
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
    await this.redis.del("catalog:videos:admin");
    await this.redis.del("catalog:videos:public_safe");
    return deletedVideo;
  }
}
