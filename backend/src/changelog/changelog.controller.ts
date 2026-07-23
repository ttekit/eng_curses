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

import { AuthGuard } from "src/auth/auth.guard";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";

import { ChangelogService } from "./changelog.service";

@Controller("changelogs")
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getPublishedChangelogs() {
    return this.changelogService.findPublished();
  }

  @Get("admin/all")
  @UseGuards(JwtAdminGuard)
  async getAllChangelogsForAdmin() {
    return this.changelogService.findAllForAdmin();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async getChangelogById(@Param("id", ParseIntPipe) id: number) {
    return this.changelogService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(FileInterceptor("image"))
  async createChangelog(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.changelogService.create(body, file);
  }

  @Patch(":id")
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(FileInterceptor("image"))
  async updateChangelog(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.changelogService.update(id, body, file);
  }

  @Delete(":id")
  @UseGuards(JwtAdminGuard)
  async deleteChangelog(@Param("id", ParseIntPipe) id: number) {
    return this.changelogService.remove(id);
  }
}
