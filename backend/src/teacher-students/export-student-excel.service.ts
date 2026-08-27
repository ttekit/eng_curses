import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as XLSX from "xlsx";

@Injectable()
export class ExportStudentExcelService {
  constructor(private readonly prisma: PrismaService) {}

  async exportStudentsExcel(teacherId: number): Promise<Buffer> {
    const students = await this.prisma.user.findMany({
      where: { teacherId },
      select: {
        name: true,
        email: true,
        class: { select: { name: true } },
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
        "Cohort / Group": s.class?.name || "-",
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
}
