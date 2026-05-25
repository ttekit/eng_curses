import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AvatarsService } from "./avatars.service";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";
import { ApiTokenOrJwtAuthGuard } from "src/auth/guards/api-token-or-jwt.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("avatars")
@Controller("avatars")
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get()
  @UseGuards(ApiTokenOrJwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all active avatars for selection" })
  async getActiveAvatars() {
    return this.avatarsService.getActiveAvatars();
  }

  @Post("upload")
  @UseGuards(ApiTokenOrJwtAuthGuard, JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Upload new avatar (Admin only)" })
  @UseInterceptors(FileInterceptor("file"))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.avatarsService.uploadAvatar(file);
  }

  @Patch(":id/status")
  @UseGuards(ApiTokenOrJwtAuthGuard, JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Enable/Disable avatar (Admin only)" })
  async toggleStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("isActive") isActive: boolean,
  ) {
    return this.avatarsService.toggleAvatarStatus(id, isActive);
  }
}
