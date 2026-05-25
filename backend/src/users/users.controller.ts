import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { ApiTokenOrJwtAuthGuard } from "../auth/guards/api-token-or-jwt.guard";
import { UserSelfOrApiGuard } from "../auth/guards/user-self-or-api.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import { ResetProgressDto } from "./dto/reset-progress.dto";
import { AdminUpdateUserDto } from "./dto/update-user.dto";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new user",
    description:
      "In production, requires `x-api-token` (enforced globally) matching API_TOKEN.",
  })
  @ApiResponse({ status: 201, description: "User successfully created." })
  @ApiResponse({
    status: 400,
    description: "Unable to create user with the provided information.",
  })
  @UseGuards(ApiTokenOrJwtAuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all users",
    description:
      "In production, requires `x-api-token` (enforced globally) matching API_TOKEN.",
  })
  @ApiResponse({ status: 200, description: "Return all users." })
  @UseGuards(ApiTokenOrJwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch("profile")
  @UseGuards(ApiTokenOrJwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update current user profile via JWT token" })
  @ApiResponse({ status: 200, description: "User successfully updated." })
  updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException(
        "Не вдалося визначити користувача з токена",
      );
    }

    return this.usersService.updateProfile(Number(userId), updateUserDto);
  }

  @Get(":id")
  @UseGuards(ApiTokenOrJwtAuthGuard, UserSelfOrApiGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("api-token")
  @ApiOperation({ summary: "Get user by ID (self or API token)" })
  @ApiResponse({ status: 200, description: "Return a single user." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 404, description: "User not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(ApiTokenOrJwtAuthGuard, UserSelfOrApiGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("api-token")
  @ApiOperation({ summary: "Update user (self or API token)" })
  @ApiResponse({ status: 200, description: "User successfully updated." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(ApiTokenOrJwtAuthGuard, UserSelfOrApiGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiSecurity("api-token")
  @ApiOperation({ summary: "Delete user (self or API token)" })
  @ApiResponse({ status: 200, description: "User successfully deleted." })
  @ApiResponse({ status: 403, description: "Forbidden." })
  @ApiResponse({ status: 404, description: "User not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Patch(":id/admin")
  @UseGuards(ApiTokenOrJwtAuthGuard, JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update user as Admin (includes role, suspension)" })
  @ApiResponse({ status: 200, description: "User updated." })
  updateAsAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() adminUpdateDto: AdminUpdateUserDto,
  ) {
    return this.usersService.updateAsAdmin(id, adminUpdateDto);
  }

  @Post("profile/progress/reset")
  @UseGuards(ApiTokenOrJwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Сброс прогресса обучения с валидацией пароля" })
  @ApiResponse({ status: 200, description: "Прогресс успешно сброшен." })
  @ApiResponse({
    status: 400,
    description: "Неверный пароль или ошибка запроса.",
  })
  async resetProfileProgress(@Req() req: any, @Body() dto: ResetProgressDto) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new BadRequestException(
        "Не удалось определить пользователя из токена",
      );
    }

    await this.usersService.resetProgress(Number(userId), dto);
    return { success: true, message: "Прогресс успешно сброшен." };
  }
}
