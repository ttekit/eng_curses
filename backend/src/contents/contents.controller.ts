import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Header,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { SkipSubscriptionCheck } from "src/auth/decorators/skip-subscription-check.decorator";
import { Express, Request, Response } from "express";
import { AuthGuard } from "src/auth/auth.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";
import { AddContentEpisodeDto } from "src/contents/dto/add-content-episode.dto";
import { ContentsService } from "./contents.service";
import { CreateContentDto } from "src/contents/dto/create-content.dto";
import { ReorderContentPlaylistDto } from "src/contents/dto/reorder-content-playlist.dto";
import { TeacherPatchContentVisibilityDto } from "src/contents/dto/teacher-patch-content-visibility.dto";
import { TeacherUploadContentDto } from "src/contents/dto/teacher-upload-content.dto";
import { UpdateContentDto } from "src/contents/dto/update-content.dto";
import { AssignExistingContentDto } from "./dto/assign-existing.dto";

function contentVideoMaxFileBytes(): number {
  const n = Number(process.env.CONTENT_VIDEO_MAX_FILE_BYTES);
  if (Number.isFinite(n) && n > 0) {
    return Math.floor(n);
  }
  return 512 * 1024 * 1024;
}

const CONTENT_VIDEO_MAX_FILE_BYTES = contentVideoMaxFileBytes();

@ApiTags("contents")
@Controller("contents")
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get("all")
  @SkipSubscriptionCheck()
  getContent() {
    return this.contentsService.getAllContent();
  }

  @Get("series/:friendlyLink")
  @SkipSubscriptionCheck()
  @ApiOperation({
    summary: "Ordered playlist for a series (Content) by friendly link",
  })
  getSeriesPlaylist(@Param("friendlyLink") friendlyLink: string) {
    return this.contentsService.getSeriesPlaylistByFriendlyLink(friendlyLink);
  }

  @Post("teacher/upload")
  @Throttle({ upload: { limit: 10, ttl: 60_000 } })
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "file", maxCount: 1 },
        { name: "thumbnailFile", maxCount: 1 },
      ],
      {
        limits: { fileSize: CONTENT_VIDEO_MAX_FILE_BYTES },
      },
    ),
  )
  @ApiOperation({
    summary:
      "Teacher: upload a lesson (MP4/ZIP) or M3U8 link. Generates captions, tags, and accepts thumbnail.",
  })
  async teacherUpload(
    @Req() req: Request & { user?: unknown },
    @Body() dto: TeacherUploadContentDto,
    @Body("videoLink") videoLink: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      thumbnailFile?: Express.Multer.File[];
    },
  ) {
    const userId = jwtSubToUserId(req.user);
    const videoFile = files?.file?.[0];
    const thumbnailFile = files?.thumbnailFile?.[0];

    if (!videoFile && !videoLink) {
      throw new BadRequestException(
        "Video file, ZIP, or M3U8 link is required",
      );
    }

    const fullDto: any = { ...dto, videoLink };

    if (
      req.body.classAssignments &&
      typeof req.body.classAssignments === "string"
    ) {
      try {
        fullDto.classAssignments = JSON.parse(req.body.classAssignments);
      } catch (e) {}
    }
    if (req.body.availableFrom) fullDto.availableFrom = req.body.availableFrom;
    if (req.body.deadline) fullDto.deadline = req.body.deadline;

    return this.contentsService.createTeacherUpload(
      userId,
      fullDto,
      videoFile,
      thumbnailFile,
    );
  }

  @Get("teacher/my-series")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Teacher: list series uploaded from profile (with caption/tag status)",
  })
  async teacherMySeries(@Req() req: Request & { user?: unknown }) {
    const userId = jwtSubToUserId(req.user);
    return this.contentsService.findTeacherMySeries(userId);
  }

  @Patch("teacher/:id/visibility")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Teacher: set catalog visibility ("public" or "unlisted") for owned series',
  })
  async teacherPatchVisibility(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: TeacherPatchContentVisibilityDto,
  ) {
    const userId = jwtSubToUserId(req.user);
    return this.contentsService.patchTeacherContentVisibility(userId, id, dto);
  }

  @Patch("teacher/:id/deadlines")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      "Teacher: update individual deadlines for assigned classes and global",
  })
  async updateTeacherContentDeadlines(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.updateTeacherContentDeadlines(
      teacherId,
      id,
      body,
    );
  }

  @Get("teacher/:id/student-results")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Get student quiz results for a specific video" })
  async getVideoStudentResults(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.getVideoStudentResults(teacherId, id);
  }

  @Get(":id")
  @SkipSubscriptionCheck()
  getContentById(@Param("id", ParseIntPipe) id: number) {
    return this.contentsService.getContentById(id);
  }

  @Post("create")
  @Throttle({ upload: { limit: 10, ttl: 60_000 } })
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "file", maxCount: 1 },
        { name: "thumbnailFile", maxCount: 1 },
      ],
      {
        limits: { fileSize: CONTENT_VIDEO_MAX_FILE_BYTES },
      },
    ),
  )
  @ApiOperation({ summary: "Admin: Create new content series" })
  async createContent(
    @Body() createContentDto: CreateContentDto,
    @Body("videoLink") videoLink: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      thumbnailFile?: Express.Multer.File[];
    },
  ) {
    const videoFile = files?.file?.[0];
    const thumbnailFile = files?.thumbnailFile?.[0];

    if (!videoFile && !videoLink) {
      throw new BadRequestException(
        "Video file, ZIP, or M3U8 link is required",
      );
    }

    const fullDto = { ...createContentDto, videoLink };

    return await this.contentsService.createContent(
      fullDto as any,
      videoFile,
      thumbnailFile,
    );
  }

  @Patch(":id/playlist")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({
    summary: "Reorder ContentMedia slots for a series (admin API token)",
  })
  async reorderPlaylist(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ReorderContentPlaylistDto,
  ): Promise<void> {
    await this.contentsService.reorderPlaylist(id, dto);
  }

  @Post(":id/episodes")
  @Throttle({ upload: { limit: 10, ttl: 60_000 } })
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "file", maxCount: 1 },
        { name: "thumbnailFile", maxCount: 1 },
      ],
      {
        limits: { fileSize: CONTENT_VIDEO_MAX_FILE_BYTES },
      },
    ),
  )
  @ApiOperation({
    summary: "Add an episode (new ContentMedia + video) to an existing series",
  })
  async addEpisode(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AddContentEpisodeDto,
    @Body("videoLink") videoLink: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      thumbnailFile?: Express.Multer.File[];
    },
  ) {
    const videoFile = files?.file?.[0];
    const thumbnailFile = files?.thumbnailFile?.[0];

    if (!videoFile && !videoLink) {
      throw new BadRequestException(
        "Video file, ZIP, or M3U8 link is required",
      );
    }

    const fullDto = { ...dto, videoLink };

    return await this.contentsService.addEpisode(
      id,
      fullDto as any,
      videoFile,
      thumbnailFile,
    );
  }

  @Get("teacher/assigned-homework")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Получить список домашек из каталога" })
  async getAssignedHomework(@Req() req: Request & { user?: unknown }) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.getAssignedHomework(teacherId);
  }

  @Delete("teacher/assign/:contentId")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Отменить заданную домашку" })
  async revokeAssignment(
    @Req() req: Request & { user?: unknown },
    @Param("contentId", ParseIntPipe) contentId: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.revokeAssignment(teacherId, contentId);
  }

  @Post("teacher/assign/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Assign an existing video as homework for classes" })
  async assignExistingContent(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AssignExistingContentDto,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.assignExistingToClasses(
      teacherId,
      id,
      dto.classAssignments,
    );
  }

  @Patch(":id")
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(
    FileInterceptor("thumbnailFile", {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  updateContent(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateContentDto,
    @UploadedFile() thumbnailFile?: Express.Multer.File,
  ) {
    return this.contentsService.updateContent(id, dto, thumbnailFile);
  }

  @Get("student/teacher-videos")
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: "Student: Get videos uploaded by their assigned teacher",
  })
  async getStudentTeacherVideos(@Req() req: Request & { user?: unknown }) {
    const studentId = jwtSubToUserId(req.user);
    return this.contentsService.getVideosForStudent(studentId);
  }

  @Get("teacher/my-students/results")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Get students results for teacher" })
  async myStudentsResults(@Req() req: Request & { user?: unknown }) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.getMyStudentsResults(teacherId);
  }

  @Delete("episode/:id")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({ summary: "Admin: Delete a specific episode from a series" })
  deleteEpisode(@Param("id", ParseIntPipe) id: number) {
    return this.contentsService.deleteEpisode(id);
  }

  @Delete("delete/:id")
  @UseGuards(JwtAdminGuard)
  @ApiOperation({ summary: "Admin: Delete a series" })
  deleteContent(@Param("id", ParseIntPipe) id: number) {
    return this.contentsService.deleteContent(id);
  }

  @Patch("episode/:id/thumbnail")
  @UseInterceptors(FileInterceptor("thumbnailFile"))
  async updateEpisodeThumbnail(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }
    return this.contentsService.updateEpisodeThumbnail(id, file);
  }

  @Delete("teacher/my-series/:id")
  @UseGuards(AuthGuard)
  async deleteTeacherSeries(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = Number(req.user.sub || req.user.id);
    return this.contentsService.deleteTeacherContent(teacherId, id);
  }
}
