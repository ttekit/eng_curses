import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { PrismaService } from "src/prisma.service";
import { VideoCaptionsService } from "src/contents/video-captions.service";
import { AddContentEpisodeDto } from "src/contents/dto/add-content-episode.dto";
import { CreateContentDto } from "src/contents/dto/create-content.dto";
import { ReorderContentPlaylistDto } from "src/contents/dto/reorder-content-playlist.dto";
import { TeacherPatchContentVisibilityDto } from "src/contents/dto/teacher-patch-content-visibility.dto";
import { TeacherUploadContentDto } from "src/contents/dto/teacher-upload-content.dto";
import { UpdateContentDto } from "src/contents/dto/update-content.dto";
import { buildSafeS3ObjectKey, publicS3ObjectUrl } from "../common/s3-key.util";
import { AuthMethod, UserRole } from "@generated/prisma/enums";
import * as XLSX from "xlsx";
import * as bcrypt from "bcrypt";
import { Redis } from "ioredis";
import AdmZip from "adm-zip";

export type TeacherStudentQuizRow = {
  id: number;
  contentVideoId: number;
  videoName: string;
  correct: number;
  total: number;
  scorePct: number;
  passed: boolean;
  createdAt: string;
};

export type TeacherStudentResultRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  englishLevel: string | null;
  videosCompleted: number;
  quizAttempts: number;
  avgQuizScorePct: number | null;
  lastPlacement: {
    scorePct: number;
    englishLevel: string;
    scoreCorrect: number;
    scoreTotal: number;
    createdAt: string;
  } | null;
  recentQuizzes: TeacherStudentQuizRow[];
};

@Injectable()
export class ContentsService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly videoCaptionsService: VideoCaptionsService,
    @Inject("REDIS_CLIENT") private readonly redis: Redis,
  ) {
    this.bucket = this.configService.getOrThrow<string>("AWS_S3_BUCKET_NAME");
    this.region =
      this.configService.get<string>("AWS_S3_REGION") ??
      this.configService.getOrThrow<string>("AWS_REGION");
    this.s3Client = new S3Client({
      region: this.region,
    });
  }

  private async processAndUploadZip(file: Express.Multer.File): Promise<string> {
    const zip = new AdmZip(file.buffer);
    const zipEntries = zip.getEntries();
    const folderUuid = randomUUID();
    let m3u8Url: string | null = null;

    const uploadPromises = zipEntries.map(async (entry) => {
      if (entry.isDirectory) return;

      const fileName = entry.name;
      if (!fileName) return;

      const fileBuffer = entry.getData();
      const s3Key = `hls_videos/${folderUuid}/${fileName}`;

      let contentType = "application/octet-stream";
      if (fileName.endsWith(".m3u8")) contentType = "application/x-mpegURL";
      else if (fileName.endsWith(".ts")) contentType = "video/MP2T";

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      if (fileName.endsWith(".m3u8")) {
        m3u8Url = publicS3ObjectUrl(this.bucket, this.region, s3Key);
      }
    });

    await Promise.all(uploadPromises);

    if (!m3u8Url) {
      throw new BadRequestException("Invalid ZIP: No .m3u8 file found inside the archive.");
    }

    return m3u8Url;
  }

  async createContent(
    dto: CreateContentDto & { videoLink?: string },
    file?: Express.Multer.File,
    thumbnailFile?: Express.Multer.File,
  ) {
    let videoUrl = dto.videoLink;

    if (file) {
      if (file.originalname.toLowerCase().endsWith(".zip")) {
        videoUrl = await this.processAndUploadZip(file);
      } else {
        const key = buildSafeS3ObjectKey(file.originalname);
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
          }),
        );
        videoUrl = publicS3ObjectUrl(this.bucket, this.region, key);
      }
    }

    if (!videoUrl) {
      throw new BadRequestException("You must provide either a video file, a ZIP archive, or a videoLink");
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const thumbKey = buildSafeS3ObjectKey(thumbnailFile.originalname);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbKey,
          Body: thumbnailFile.buffer,
        }),
      );
      thumbnailUrl = publicS3ObjectUrl(this.bucket, this.region, thumbKey);
    }

    const created = await this.prisma.content.create({
      data: {
        name: dto.name,
        description: dto.description,
        friendlyLink: dto.friendlyLink,
        category: {
          create: {
            playlistPosition: 0,
            ContentVideo: {
              create: {
                videoLink: videoUrl,
                videoName: dto.name,
                playlistPosition: 0,
                thumbnailUrl: thumbnailUrl,
              },
            },
          },
        },
      },
      include: {
        category: {
          include: {
            ContentVideo: true,
          },
        },
      },
    });

    const contentVideoId = created.category[0]?.ContentVideo?.[0]?.id;
    if (contentVideoId == null) {
      throw new InternalServerErrorException(
        "Created content is missing a ContentVideo id",
      );
    }

    return {
      ...created,
      contentVideoId,
    };
  }

  async updateContent(
    id: number,
    dto: UpdateContentDto,
    file?: Express.Multer.File,
  ) {
    const updateContent = await this.prisma.content.update({
      where: { id },
      data: {
        ...dto,
      },
    });

    if (file) {
      const contentMedia = await this.prisma.contentMedia.findFirst({
        where: { categoryId: id },
        orderBy: { playlistPosition: "asc" },
      });

      if (contentMedia) {
        const existingVideo = await this.prisma.contentVideo.findFirst({
          where: { contentId: contentMedia.id },
          orderBy: { playlistPosition: "asc" },
        });

        if (existingVideo?.videoLink) {
          try {
            const url = new URL(existingVideo.videoLink);
            const oldKey = url.pathname.replace(/^\//, "");
            if (oldKey) {
              await this.s3Client.send(
                new DeleteObjectCommand({
                  Bucket: this.bucket,
                  Key: decodeURIComponent(oldKey),
                }),
              );
            }
          } catch {
            const fallbackKey = existingVideo.videoLink.split("/").pop();
            if (fallbackKey) {
              await this.s3Client.send(
                new DeleteObjectCommand({
                  Bucket: this.bucket,
                  Key: decodeURIComponent(fallbackKey),
                }),
              );
            }
          }
        }

        let newUrl = "";
        if (file.originalname.toLowerCase().endsWith(".zip")) {
          newUrl = await this.processAndUploadZip(file);
        } else {
          const key = buildSafeS3ObjectKey(file.originalname);
          await this.s3Client.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: key,
              Body: file.buffer,
            }),
          );
          newUrl = publicS3ObjectUrl(this.bucket, this.region, key);
        }

        await this.prisma.contentVideo.updateMany({
          where: { contentId: contentMedia.id },
          data: { videoLink: newUrl },
        });
      }
    }

    return updateContent;
  }

  async deleteContent(id: number) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) throw new NotFoundException("Content not found");

    await this.prisma.content.delete({
      where: { id },
    });

    return { success: true };
  }

  async getAllContent() {
    return await this.prisma.content.findMany();
  }

  async getContentById(id: number) {
    return await this.prisma.content.findUnique({
      where: { id },
    });
  }

  async getSeriesPlaylistByFriendlyLink(friendlyLink: string) {
    const content = await this.prisma.content.findUnique({
      where: { friendlyLink },
      include: {
        category: {
          orderBy: { playlistPosition: "asc" },
          include: {
            ContentVideo: {
              orderBy: { playlistPosition: "asc" },
            },
          },
        },
      },
    });
    if (!content) {
      throw new NotFoundException(
        `Content with friendly link "${friendlyLink}" not found`,
      );
    }
    return content;
  }

  async reorderPlaylist(
    contentId: number,
    dto: ReorderContentPlaylistDto,
  ): Promise<void> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }
    const existing = await this.prisma.contentMedia.findMany({
      where: { categoryId: contentId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((r) => r.id));
    const ordered = dto.orderedContentMediaIds;
    if (existingIds.size !== ordered.length) {
      throw new BadRequestException(
        "orderedContentMediaIds must include every episode slot for this series",
      );
    }
    for (const id of ordered) {
      if (!existingIds.has(id)) {
        throw new BadRequestException(
          `ContentMedia ${id} does not belong to series ${contentId}`,
        );
      }
    }
    const unique = new Set(ordered);
    if (unique.size !== ordered.length) {
      throw new BadRequestException("Duplicate ContentMedia id in ordering");
    }
    const offset = 1_000_000;
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < ordered.length; i++) {
        await tx.contentMedia.update({
          where: { id: ordered[i]! },
          data: { playlistPosition: offset + i },
        });
      }
      for (let i = 0; i < ordered.length; i++) {
        await tx.contentMedia.update({
          where: { id: ordered[i]! },
          data: { playlistPosition: i },
        });
      }
    });
  }

  async addEpisode(
    contentId: number,
    dto: AddContentEpisodeDto & { videoLink?: string },
    file?: Express.Multer.File,
    thumbnailFile?: Express.Multer.File,
  ) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }
    const maxRow = await this.prisma.contentMedia.aggregate({
      where: { categoryId: contentId },
      _max: { playlistPosition: true },
    });
    const playlistPosition = (maxRow._max.playlistPosition ?? -1) + 1;

    let videoUrl = dto.videoLink;

    if (file) {
      if (file.originalname.toLowerCase().endsWith(".zip")) {
        videoUrl = await this.processAndUploadZip(file);
      } else {
        const key = buildSafeS3ObjectKey(file.originalname);
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
          }),
        );
        videoUrl = publicS3ObjectUrl(this.bucket, this.region, key);
      }
    }

    if (!videoUrl) {
      throw new BadRequestException("You must provide either a video file, a ZIP archive, or a videoLink");
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const thumbKey = buildSafeS3ObjectKey(thumbnailFile.originalname);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbKey,
          Body: thumbnailFile.buffer,
        }),
      );
      thumbnailUrl = publicS3ObjectUrl(this.bucket, this.region, thumbKey);
    }

    const createdMedia = await this.prisma.contentMedia.create({
      data: {
        categoryId: contentId,
        playlistPosition,
        ContentVideo: {
          create: {
            videoLink: videoUrl,
            videoName: dto.videoName,
            videoDescription: dto.videoDescription ?? null,
            playlistPosition: 0,
            thumbnailUrl: thumbnailUrl,
          },
        },
      },
      include: {
        ContentVideo: true,
      },
    });
    const contentVideoId = createdMedia.ContentVideo[0]?.id;
    if (contentVideoId == null) {
      throw new InternalServerErrorException(
        "Created episode is missing a ContentVideo id",
      );
    }
    return { contentVideoId, contentMediaId: createdMedia.id };
  }

  private async requireTeacherAccount(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== UserRole.TEACHER) {
      throw new ForbiddenException(
        "Only teacher accounts can use this resource.",
      );
    }
  }

  private buildTeacherFriendlyLink(userId: number): string {
    const tail = randomUUID().replace(/-/g, "").slice(0, 16);
    return `t-${userId}-${tail}`;
  }

  async createTeacherUpload(
    userId: number,
    dto: TeacherUploadContentDto & { videoLink?: string },
    file?: Express.Multer.File,
    thumbnailFile?: Express.Multer.File,
  ) {
    await this.requireTeacherAccount(userId);
    let friendlyLink = "";
    for (let attempt = 0; attempt < 12; attempt++) {
      friendlyLink = this.buildTeacherFriendlyLink(userId);
      const clash = await this.prisma.content.findUnique({
        where: { friendlyLink },
        select: { id: true },
      });
      if (!clash) {
        break;
      }
      if (attempt === 11) {
        throw new InternalServerErrorException(
          "Could not allocate a unique link. Try again.",
        );
      }
    }

    let videoUrl = dto.videoLink;

    if (file) {
      if (file.originalname.toLowerCase().endsWith(".zip")) {
        videoUrl = await this.processAndUploadZip(file);
      } else {
        const key = buildSafeS3ObjectKey(file.originalname);
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
          }),
        );
        videoUrl = publicS3ObjectUrl(this.bucket, this.region, key);
      }
    }

    if (!videoUrl) {
      throw new BadRequestException("You must provide either a video file or a videoLink");
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const thumbKey = buildSafeS3ObjectKey(thumbnailFile.originalname);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbKey,
          Body: thumbnailFile.buffer,
        }),
      );
      thumbnailUrl = publicS3ObjectUrl(this.bucket, this.region, thumbKey);
    }

    const name = dto.name.trim();
    const visibility = dto.visibility.trim();
    if (visibility !== "public" && visibility !== "unlisted") {
      throw new BadRequestException(
        'visibility must be "public" or "unlisted"',
      );
    }
    const created = await this.prisma.content.create({
      data: {
        name,
        description: "",
        friendlyLink,
        ownerUserId: userId,
        visibility,
        category: {
          create: {
            playlistPosition: 0,
            ContentVideo: {
              create: {
                videoLink: videoUrl,
                videoName: name,
                playlistPosition: 0,
                thumbnailUrl: thumbnailUrl,
              },
            },
          },
        },
      },
      include: {
        category: {
          include: {
            ContentVideo: true,
          },
        },
      },
    });
    const contentVideoId = created.category[0]?.ContentVideo?.[0]?.id;
    if (contentVideoId == null) {
      throw new InternalServerErrorException(
        "Created content is missing a ContentVideo id",
      );
    }
    const captionsRow =
      await this.videoCaptionsService.generateCaptions(contentVideoId);
    await this.redis.del(`catalog:videos:teacher:${userId}`);
    await this.redis.del("catalog:videos");
    return {
      ...created,
      contentVideoId,
      captionsReady: captionsRow != null,
    };
  }

  async findTeacherMySeries(userId: number) {
    await this.requireTeacherAccount(userId);
    const rows = await this.prisma.content.findMany({
      where: { ownerUserId: userId },
      orderBy: { createAt: "desc" },
      include: {
        category: {
          orderBy: { playlistPosition: "asc" },
          take: 1,
          include: {
            ContentVideo: {
              orderBy: { playlistPosition: "asc" },
              take: 1,
              include: {
                videoCaption: {
                  select: { subtitlesFileLink: true },
                },
              },
            },
            stats: true,
          },
        },
      },
    });
    return rows.map((c) => {
      const slot = c.category[0];
      const vid = slot?.ContentVideo?.[0];
      const stats = slot?.stats;
      return {
        contentId: c.id,
        name: c.name,
        friendlyLink: c.friendlyLink,
        visibility: c.visibility,
        contentVideoId: vid?.id ?? null,
        captionsReady: Boolean(vid?.videoCaption?.subtitlesFileLink?.trim()),
        systemTags: stats?.systemTags ?? [],
        userTags: stats?.userTags ?? [],
        processingComplexity: stats?.processingComplexity ?? null,
      };
    });
  }

  async deleteEpisode(contentMediaId: number) {
    const media = await this.prisma.contentMedia.findUnique({
      where: { id: contentMediaId },
    });

    if (!media) {
      throw new NotFoundException("Episode not found");
    }

    return this.prisma.contentMedia.delete({
      where: { id: contentMediaId },
    });
  }

  async patchTeacherContentVisibility(
    userId: number,
    contentId: number,
    dto: TeacherPatchContentVisibilityDto,
  ) {
    await this.requireTeacherAccount(userId);
    const owned = await this.prisma.content.findFirst({
      where: { id: contentId, ownerUserId: userId },
      select: { id: true },
    });
    if (!owned) {
      throw new NotFoundException(
        "Series not found or not owned by this account.",
      );
    }
    const visibility = dto.visibility.trim();
    if (visibility !== "public" && visibility !== "unlisted") {
      throw new BadRequestException(
        'visibility must be "public" or "unlisted"',
      );
    }

    const updatedContent = this.prisma.content.update({
      where: { id: contentId },
      data: { visibility },
      select: {
        id: true,
        name: true,
        friendlyLink: true,
        visibility: true,
      },
    });
    await this.redis.del(`catalog:videos:teacher:${userId}`);
    await this.redis.del("catalog:videos");

    return updatedContent;
  }

  async getVideosForStudent(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { teacherId: true },
    });

    if (!student || !student.teacherId) {
      return [];
    }

    const rows = await this.prisma.content.findMany({
      where: {
        ownerUserId: student.teacherId,
        visibility: { in: ["public", "unlisted"] },
      },
      orderBy: { createAt: "desc" },
      include: {
        category: {
          orderBy: { playlistPosition: "asc" },
          take: 1,
          include: {
            ContentVideo: {
              orderBy: { playlistPosition: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    return rows.map((c) => {
      const slot = c.category[0];
      const vid = slot?.ContentVideo?.[0];
      return {
        contentId: c.id,
        name: c.name,
        friendlyLink: c.friendlyLink,
        contentVideoId: vid?.id ?? null,
        videoLink: vid?.videoLink ?? null,
        thumbnailUrl: vid?.thumbnailUrl ?? null,
      };
    });
  }

  private async getDistinctCompletedVideosByUser(
    userIds: number[],
  ): Promise<Map<number, number>> {
    if (userIds.length === 0) return new Map();
    const rows = await this.prisma.watchSession.findMany({
      where: {
        userId: { in: userIds },
        completed: true,
      },
      select: { userId: true, contentVideoId: true },
      distinct: ["userId", "contentVideoId"],
    });
    const counts = new Map<number, number>();
    for (const r of rows) {
      counts.set(r.userId, (counts.get(r.userId) ?? 0) + 1);
    }
    return counts;
  }

  async getMyStudentsResults(
    teacherId: number,
  ): Promise<{ students: TeacherStudentResultRow[] }> {
    const me = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { role: true },
    });

    if (!me || (me.role !== "TEACHER" && me.role !== "ADMIN")) {
      throw new ForbiddenException("Only teachers can view student results.");
    }

    const students = await this.prisma.user.findMany({
      where: { teacherId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        additionalUserData: { select: { englishLevel: true } },
      },
    });

    const ids = students.map((s) => s.id);
    if (ids.length === 0) {
      return { students: [] };
    }

    const [watchByUser, attemptGroups, placements, recentPerStudent] =
      await Promise.all([
        this.getDistinctCompletedVideosByUser(ids),
        this.prisma.comprehensionTestAttempt.groupBy({
          by: ["userId"],
          where: { userId: { in: ids } },
          _avg: { scorePct: true },
          _count: { _all: true },
        }),
        this.prisma.placementAttempt.findMany({
          where: { userId: { in: ids } },
          orderBy: { createdAt: "desc" },
          distinct: ["userId"],
          select: {
            userId: true,
            scorePct: true,
            englishLevel: true,
            scoreCorrect: true,
            scoreTotal: true,
            createdAt: true,
          },
        }),
        Promise.all(
          ids.map((userId) =>
            this.prisma.comprehensionTestAttempt.findMany({
              where: { userId },
              take: 8,
              orderBy: { createdAt: "desc" },
              include: {
                contentVideo: { select: { videoName: true } },
              },
            }),
          ),
        ),
      ]);

    const attemptAvgMap = new Map(
      attemptGroups.map((g) => [
        g.userId,
        { count: g._count._all, avg: g._avg.scorePct },
      ]),
    );
    const placementMap = new Map(placements.map((p) => [p.userId, p]));
    const recentByUser = new Map<number, (typeof recentPerStudent)[0]>();
    ids.forEach((uid, i) => {
      recentByUser.set(uid, recentPerStudent[i] ?? []);
    });

    const out: TeacherStudentResultRow[] = students.map((s) => {
      const agg = attemptAvgMap.get(s.id);
      const recent = (recentByUser.get(s.id) ?? []).map(
        (a): TeacherStudentQuizRow => ({
          id: a.id,
          contentVideoId: a.contentVideoId,
          videoName: a.contentVideo.videoName,
          correct: a.correct,
          total: a.total,
          scorePct: a.scorePct,
          passed: a.passed,
          createdAt: a.createdAt.toISOString(),
        }),
      );
      const lp = placementMap.get(s.id);

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        englishLevel: s.additionalUserData?.englishLevel ?? null,
        videosCompleted: watchByUser.get(s.id) ?? 0,
        quizAttempts: agg?.count ?? 0,
        avgQuizScorePct:
          typeof agg?.avg === "number" && Number.isFinite(agg.avg)
            ? Math.round(agg.avg * 10) / 10
            : null,
        lastPlacement: lp
          ? { ...lp, createdAt: lp.createdAt.toISOString() }
          : null,
        recentQuizzes: recent,
      };
    });

    return { students: out };
  }

  async addStudent(teacherId: number, data: { name: string; email: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ForbiddenException("Пользователь с таким email уже существует");
    }

    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const tempPassword = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const created = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "STUDENT",
        teacherId: teacherId,
        method: "CREDENTIALS",
        isVerified: true,
      },
    });

    return { student: created, tempPassword };
  }

  async exportStudentsExcel(teacherId: number): Promise<Buffer> {
    const students = await this.prisma.user.findMany({
      where: { teacherId },
      select: {
        name: true,
        email: true,
        additionalUserData: { select: { englishLevel: true } },
        watchSessions: { where: { completed: true } },
        comprehensionTestAttempts: true,
      },
    });

    const data = students.map((s) => {
      const attemptsCount = s.comprehensionTestAttempts.length;
      const avgScore =
        attemptsCount > 0
          ? s.comprehensionTestAttempts.reduce(
            (acc, curr) => acc + curr.scorePct,
            0,
          ) / attemptsCount
          : 0;

      return {
        "Student Name": s.name,
        "Email Address": s.email,
        "English Level": s.additionalUserData?.englishLevel || "-",
        "Completed Videos": s.watchSessions.length,
        "Quiz Attempts": attemptsCount,
        "Average Score (%)": Math.round(avgScore * 10) / 10,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Students");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

  async updateStudent(
    teacherId: number,
    studentId: number,
    data: { name: string; email: string },
  ) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId },
    });
    if (!student)
      throw new ForbiddenException("Ученик не найден или не принадлежит вам");

    return this.prisma.user.update({
      where: { id: studentId },
      data: { name: data.name, email: data.email },
    });
  }

  async removeStudent(teacherId: number, studentId: number) {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, teacherId },
    });
    if (!student) throw new ForbiddenException("Ученик не найден");

    return this.prisma.user.delete({
      where: { id: studentId },
    });
  }

  async exportStudentsCsv(teacherId: number): Promise<string> {
    const students = await this.prisma.user.findMany({
      where: { teacherId },
      select: {
        name: true,
        email: true,
        additionalUserData: { select: { englishLevel: true } },
        watchSessions: { where: { completed: true } },
        comprehensionTestAttempts: true,
      },
    });

    const headers = [
      "Name",
      "Email",
      "English Level",
      "Videos Completed",
      "Quiz Attempts",
      "Avg Score %",
    ];

    const rows = students.map((s) => {
      const attemptsCount = s.comprehensionTestAttempts.length;
      const avgScore =
        attemptsCount > 0
          ? s.comprehensionTestAttempts.reduce(
            (acc, curr) => acc + curr.scorePct,
            0,
          ) / attemptsCount
          : 0;

      return [
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.additionalUserData?.englishLevel || "N/A"}"`,
        s.watchSessions.length,
        attemptsCount,
        `"${Math.round(avgScore * 10) / 10}"`,
      ];
    });

    return (
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    );
  }

  async deleteTeacherContent(teacherId: number, contentId: number) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, ownerUserId: teacherId },
    });

    if (!content) {
      throw new ForbiddenException("Video not found or you are not the owner");
    }

    await this.prisma.content.delete({
      where: { id: contentId },
    });

    await this.redis.del(`catalog:videos:teacher:${teacherId}`);
    await this.redis.del("catalog:videos");

    return { success: true };
  }
}