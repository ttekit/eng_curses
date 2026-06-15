import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { TeacherStudentQuizRow, TeacherStudentResultRow } from "./types";
import { UserRole } from "@generated/prisma/enums";

@Injectable()
export class StudentTeacherResults {
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

    if (!me || (me.role !== UserRole.TEACHER && me.role !== UserRole.ADMIN)) {
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
        classId: true,
        class: { select: { name: true } },
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
        role: s.role as string,
        classId: s.classId,
        className: s.class?.name ?? null,
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
}
