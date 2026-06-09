import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ApiTokenOrJwtAuthGuard } from "../auth/guards/api-token-or-jwt.guard";
import { TeacherStudentsService } from "./teacher-students.service";
import { AuthGuard } from "src/auth/auth.guard";
import { jwtSubToUserId } from "src/auth/jwt-subject.util";
import { Request, Response } from "express";
import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";

type AuthedRequest = Request & {
  user?: { sub?: number };
  authViaApiToken?: boolean;
};

@ApiTags("teacher")
@Controller("teacher")
export class TeacherStudentsController {
  constructor(
    private readonly teacherStudentsService: TeacherStudentsService,
  ) {}

  @Post("classes")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a new class" })
  @ApiResponse({
    status: 201,
    description: "The class has been successfully created.",
  })
  async createClass(
    @Req() req: Request & { user?: unknown },
    @Body() dto: CreateClassDto,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.createClass(teacherId, dto);
  }

  @Get("classes")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get a list of all classes for the teacher" })
  @ApiResponse({
    status: 200,
    description: "List of classes successfully retrieved.",
  })
  async getMyClasses(@Req() req: Request & { user?: unknown }) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.getMyClasses(teacherId);
  }

  @Get("classes/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get detailed information about a class and its students",
  })
  @ApiResponse({ status: 200, description: "Class information retrieved." })
  async getClassById(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.getClassById(teacherId, id);
  }

  @Patch("classes/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update class name" })
  @ApiResponse({
    status: 200,
    description: "Class name updated successfully.",
  })
  async updateClass(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.updateClass(teacherId, id, dto);
  }

  @Delete("classes/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete a class" })
  @ApiResponse({ status: 200, description: "Class successfully deleted." })
  async removeClass(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.removeClass(teacherId, id);
  }

  @Get("my-students/results")
  @UseGuards(ApiTokenOrJwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary:
      "List students assigned to this teacher with watch/quiz/placement summaries (JWT, teacher role only)",
  })
  @ApiResponse({ status: 200, description: "Student results returned." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Not a teacher." })
  async myStudentsResults(@Req() req: AuthedRequest) {
    if (req.authViaApiToken) {
      throw new ForbiddenException("Use a teacher login (JWT).");
    }
    const sub = req.user?.sub;
    const id = typeof sub === "number" ? sub : Number(sub);
    if (!Number.isFinite(id)) {
      throw new ForbiddenException();
    }
    return this.teacherStudentsService.getMyStudentsResults(id);
  }

  @Post("my-students")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Add a new student" })
  async addStudent(
    @Req() req: Request & { user?: unknown },
    @Body() body: { name: string; email: string; classId?: number },
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.addStudent(teacherId, body);
  }

  @Patch("my-students/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Edit student details" })
  async updateStudent(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { name: string; email: string },
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.updateStudent(teacherId, id, body);
  }

  @Delete("my-students/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Remove a student" })
  async removeStudent(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.removeStudent(teacherId, id);
  }

  @Get("my-students/export")
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
    const buffer =
      await this.teacherStudentsService.exportStudentsExcel(teacherId);
    res.send(buffer);
  }

  @Post("my-students/:id/reset-password")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Reset a student's password" })
  async resetStudentPassword(
    @Req() req: Request & { user?: unknown },
    @Param("id", ParseIntPipe) id: number,
  ) {
    const teacherId = jwtSubToUserId(req.user);
    return this.teacherStudentsService.resetStudentPassword(teacherId, id);
  }
}
