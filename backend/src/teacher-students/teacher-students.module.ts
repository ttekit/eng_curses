import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma.module";
import { TeacherStudentsController } from "./teacher-students.controller";
import { TeacherStudentsService } from "./teacher-students.service";
import { TeacherClassesService } from "./teacher-classes.service";
import { ExportStudentExcelService } from "./export-student-excel.service";
import { StudentTeacherResults } from "./student-teacher-results.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeacherStudentsController],
  providers: [
    TeacherStudentsService,
    TeacherClassesService,
    ExportStudentExcelService,
    StudentTeacherResults,
  ],
})
export class TeacherStudentsModule {}