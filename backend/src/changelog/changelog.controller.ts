import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

// Подставь свои пути к гардам
import { AuthGuard } from "src/auth/auth.guard";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";

import { ChangelogService } from "./changelog.service";

@Controller("changelogs")
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  // =========================================================
  // ПУБЛИЧНЫЕ РОУТЫ (Для чтения всеми учениками)
  // =========================================================

  // Отдает ТОЛЬКО опубликованные новости юзерам
  @Get()
  @UseGuards(AuthGuard)
  async getPublishedChangelogs() {
    return this.changelogService.findPublished();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getChangelogById(@Param("id", ParseIntPipe) id: number) {
    return this.changelogService.findOne(id);
  }

  // =========================================================
  // АДМИНСКИЕ РОУТЫ (Для управления контентом)
  // =========================================================

  @Get("admin/all")
  @UseGuards(JwtAdminGuard)
  async getAllChangelogsForAdmin() {
    return this.changelogService.findAllForAdmin();
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(FileInterceptor("image"))
  async createChangelog(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // FormData передает всё в виде строк, конвертируем isPublished в boolean
    const data = {
      ...body,
      isPublished: body.isPublished === "true",
    };
    return this.changelogService.create(data, file);
  }

  @Patch(":id")
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(FileInterceptor("image"))
  async updateChangelog(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Конвертируем isPublished в boolean
    const data = {
      ...body,
      isPublished: body.isPublished === "true",
    };
    return this.changelogService.update(id, data, file);
  }

  @Delete(":id")
  @UseGuards(JwtAdminGuard)
  async deleteChangelog(@Param("id", ParseIntPipe) id: number) {
    return this.changelogService.remove(id);
  }
}
