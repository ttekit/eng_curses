import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import * as XLSX from "xlsx";
import * as bcrypt from "bcrypt";
import { generateSecurePassword } from "src/common/utils/password.util";

export type TeacherStudentQuizRow = {
  id: number;
  contentVideoId: number;
  videoName: string;
  correct: number;
  total: number;
  scorePct: number;
  passed: boolean;
  createdAt: string;
  answers?: any;
  summaryText?: string | null;
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
export class TeacherStudentsService {
  constructor(private readonly prisma: PrismaService) {}

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

    const [watchMap, attemptGroups, placements, recentPerStudent] =
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
        (a: any): TeacherStudentQuizRow => ({
          id: a.id,
          contentVideoId: a.contentVideoId,
          videoName: a.contentVideo.videoName,
          correct: a.correct,
          total: a.total,
          scorePct: a.scorePct,
          passed: a.passed,
          createdAt: a.createdAt.toISOString(),
          answers: a.answers || a.details?.answers,
          summaryText:
            a.summaryText || a.writtenSummary || a.openAnswer || null,
        }),
      );
      const lp = placementMap.get(s.id);

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        role: s.role,
        englishLevel: s.additionalUserData?.englishLevel ?? null,
        videosCompleted: watchMap.get(s.id) ?? 0,
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

    const tempPassword = generateSecurePassword(16);
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
}
