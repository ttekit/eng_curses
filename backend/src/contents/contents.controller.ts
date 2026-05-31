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
  constructor(private readonly contentsService: ContentsService) { }

  @Get("all")
  getContent() {
    return this.contentsService.getAllContent();
  }

  @Get("series/:friendlyLink")
  @ApiOperation({
    summary: "Ordered playlist for a series (Content) by friendly link",
  })
  getSeriesPlaylist(@Param("friendlyLink") friendlyLink: string) {
    return this.contentsService.getSeriesPlaylistByFriendlyLink(friendlyLink);
  }

  @Post("teacher/upload")
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
    @Body('videoLink') videoLink: string,
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
      throw new BadRequestException("Video file, ZIP, or M3U8 link is required");
    }

    const fullDto = { ...dto, videoLink };

    return this.contentsService.createTeacherUpload(
      userId,
      fullDto as any,
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

  @Get(":id")
  getContentById(@Param("id", ParseIntPipe) id: number) {
    return this.contentsService.getContentById(id);
  }

  @Post("create")
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
    @Body('videoLink') videoLink: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      thumbnailFile?: Express.Multer.File[];
    },
  ) {
    const videoFile = files?.file?.[0];
    const thumbnailFile = files?.thumbnailFile?.[0];

    if (!videoFile && !videoLink) {
      throw new BadRequestException("Video file, ZIP, or M3U8 link is required");
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
    @Body('videoLink') videoLink: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      thumbnailFile?: Express.Multer.File[];
    },
  ) {
    const videoFile = files?.file?.[0];
    const thumbnailFile = files?.thumbnailFile?.[0];

    if (!videoFile && !videoLink) {
      throw new BadRequestException("Video file, ZIP, or M3U8 link is required");
    }

    const fullDto = { ...dto, videoLink };

    return await this.contentsService.addEpisode(
      id,
      fullDto as any,
      videoFile,
      thumbnailFile,
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

  @Post("teacher/my-students")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Add a new student" })
  async addStudent(
    @Req() req: Request & { user?: unknown },
    @Body() body: { name: string; email: string },
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.addStudent(teacherId, body);
  }

  @Patch("teacher/my-students/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Edit student details" })
  async updateStudent(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { name: string; email: string },
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.updateStudent(teacherId, id, body);
  }

  @Delete("teacher/my-students/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Remove a student" })
  async removeStudent(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.contentsService.removeStudent(teacherId, id);
  }

  @Get("teacher/my-students/export")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Export students to Excel (.xlsx)" })
  @Header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  @Header("Content-Disposition", 'attachment; filename="students.xlsx"')
  async exportStudents(
    @Req() req: Request & { user?: unknown },
    @Res() res: Response,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    const buffer = await this.contentsService.exportStudentsExcel(teacherId);
    res.send(buffer);
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