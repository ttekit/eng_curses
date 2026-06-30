import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  LEADERBOARD_MIN_SCORE_PCT,
  LEADERBOARD_TOP_LIMIT,
} from "./leaderboard.constants";
import {
  build_leaderboard_entries,
  resolve_leaderboard_rank,
} from "./leaderboard-rank.util";
import type { LeaderboardResponseDto } from "./leaderboard.types";

type LeaderboardQueryRow = {
  user_id: number;
  name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  english_level: string | null;
  high_score_videos: bigint;
};

type UserCountRow = {
  high_score_videos: bigint | null;
};

type UsersAheadRow = {
  ahead: bigint;
};

const FAKE_USERS: LeaderboardQueryRow[] = [
  {
    user_id: -1,
    name: "akinatorPro",
    avatar_url: "https://kpi-eng-course.s3.us-east-1.amazonaws.com/avatars/1780491771147-Untitled920260526171609.png",
    xp: 1500,
    level: 5,
    english_level: "C1",
    high_score_videos: 14n,
  },
  {
    user_id: -2,
    name: "TerryBerry",
    avatar_url: "https://kpi-eng-course.s3.us-east-1.amazonaws.com/avatars/1780493028277-Untitled1120260529175155.png",
    xp: 1200,
    level: 4,
    english_level: "B1",
    high_score_videos: 9n,
  },
  {
    user_id: -3,
    name: "David",
    avatar_url: "https://kpi-eng-course.s3.us-east-1.amazonaws.com/avatars/1780570252245-Untitled1920260604134537.png",
    xp: 800,
    level: 3,
    english_level: "A2",
    high_score_videos: 6n,
  },
  {
    user_id: -4,
    name: "LoveHarry",
    avatar_url: null,
    xp: 450,
    level: 2,
    english_level: "B1",
    high_score_videos: 4n,
  },
  {
    user_id: -5,
    name: "MichaelDeSanta",
    avatar_url: null,
    xp: 300,
    level: 1,
    english_level: "A1",
    high_score_videos: 3n,
  },
  {
    user_id: -6,
    name: "LorenaMoiii",
    avatar_url: "https://kpi-eng-course.s3.us-east-1.amazonaws.com/avatars/1780997738607-Untitled2220260609123324.png",
    xp: 200,
    level: 1,
    english_level: "A2",
    high_score_videos: 2n,
  }
];

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) { }

  async get_leaderboard(currentUserId: number): Promise<LeaderboardResponseDto> {
    const [dbTopRows, currentUserCount, usersAhead] = await Promise.all([
      this.fetch_top_rows(),
      this.fetch_user_high_score_count(currentUserId),
      this.fetch_users_ahead(currentUserId),
    ]);

    // 1. Смешиваем реальных пользователей из БД с фейковыми
    const allRows = [...dbTopRows, ...FAKE_USERS];

    // 2. Заново сортируем их по количеству видео (по убыванию), затем по имени
    allRows.sort((a, b) => {
      const diff = Number(b.high_score_videos) - Number(a.high_score_videos);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });

    // 3. Обрезаем список до лимита (например, топ-10)
    const topRows = allRows.slice(0, LEADERBOARD_TOP_LIMIT);

    const highScoreVideoCount = Number(currentUserCount?.high_score_videos ?? 0);

    const entries = build_leaderboard_entries(
      topRows.map((row) => ({
        userId: row.user_id,
        name: row.name,
        avatarUrl: row.avatar_url,
        xp: row.xp,
        level: row.level,
        highScoreVideoCount: Number(row.high_score_videos),
        englishLevel: row.english_level,
      })),
      currentUserId,
    );

    // 4. Корректируем ранг для текущего реального пользователя
    // Добавляем к количеству "людей впереди" фейковых юзеров, у которых счет больше
    const fakeUsersAheadCount = FAKE_USERS.filter(
      (fake) => Number(fake.high_score_videos) > highScoreVideoCount
    ).length;

    const totalUsersAhead = Number(usersAhead?.ahead ?? 0) + fakeUsersAheadCount;

    const inTopList = entries.some((entry) => entry.isCurrentUser);
    const currentUserRank = inTopList
      ? (entries.find((entry) => entry.isCurrentUser)?.rank ?? null)
      : resolve_leaderboard_rank(
        highScoreVideoCount,
        totalUsersAhead,
      );

    return {
      minScorePct: LEADERBOARD_MIN_SCORE_PCT,
      entries,
      currentUserRank,
      currentUserHighScoreVideoCount: highScoreVideoCount,
    };
  }

  // ... дальше fetch_top_rows, fetch_user_high_score_count и fetch_users_ahead остаются без изменений ...

  private fetch_top_rows(): Promise<LeaderboardQueryRow[]> {
    return this.prisma.$queryRaw<LeaderboardQueryRow[]>`
      WITH best_per_video AS (
        SELECT
          cta.user_id,
          cta.content_video_id,
          MAX(cta.score_pct) AS best_score_pct
        FROM comprehension_test_attempts cta
        INNER JOIN watch_sessions ws
          ON ws.user_id = cta.user_id
          AND ws.content_video_id = cta.content_video_id
          AND ws.completed = true
        GROUP BY cta.user_id, cta.content_video_id
      ),
      qualifying AS (
        SELECT user_id, content_video_id
        FROM best_per_video
        WHERE best_score_pct >= ${LEADERBOARD_MIN_SCORE_PCT}
      ),
      ranked AS (
        SELECT
          q.user_id,
          COUNT(DISTINCT q.content_video_id)::bigint AS high_score_videos
        FROM qualifying q
        GROUP BY q.user_id
      )
      SELECT
        u.id AS user_id,
        u.name,
        u.avatar_url,
        u.xp,
        u.level,
        aud."englishLevel" AS english_level,
        r.high_score_videos
      FROM ranked r
      INNER JOIN users u ON u.id = r.user_id
      LEFT JOIN additional_user_data aud ON aud."userId" = u.id
      WHERE u.is_suspended = false
        AND u.role NOT IN ('TEACHER', 'ADMIN')
      ORDER BY r.high_score_videos DESC, u.name ASC
      LIMIT ${LEADERBOARD_TOP_LIMIT}
    `;
  }

  private fetch_user_high_score_count(
    userId: number,
  ): Promise<UserCountRow | undefined> {
    return this.prisma
      .$queryRaw<UserCountRow[]>`
        WITH best_per_video AS (
          SELECT
            cta.user_id,
            cta.content_video_id,
            MAX(cta.score_pct) AS best_score_pct
          FROM comprehension_test_attempts cta
          INNER JOIN watch_sessions ws
            ON ws.user_id = cta.user_id
            AND ws.content_video_id = cta.content_video_id
            AND ws.completed = true
          WHERE cta.user_id = ${userId}
          GROUP BY cta.user_id, cta.content_video_id
        )
        SELECT COUNT(*)::bigint AS high_score_videos
        FROM best_per_video
        WHERE best_score_pct >= ${LEADERBOARD_MIN_SCORE_PCT}
      `
      .then((rows) => rows[0]);
  }

  private fetch_users_ahead(userId: number): Promise<UsersAheadRow | undefined> {
    return this.prisma
      .$queryRaw<UsersAheadRow[]>`
        WITH best_per_video AS (
          SELECT
            cta.user_id,
            cta.content_video_id,
            MAX(cta.score_pct) AS best_score_pct
          FROM comprehension_test_attempts cta
          INNER JOIN watch_sessions ws
            ON ws.user_id = cta.user_id
            AND ws.content_video_id = cta.content_video_id
            AND ws.completed = true
          GROUP BY cta.user_id, cta.content_video_id
        ),
        qualifying AS (
          SELECT user_id, content_video_id
          FROM best_per_video
          WHERE best_score_pct >= ${LEADERBOARD_MIN_SCORE_PCT}
        ),
        ranked AS (
          SELECT
            q.user_id,
            COUNT(DISTINCT q.content_video_id)::bigint AS high_score_videos
          FROM qualifying q
          GROUP BY q.user_id
        ),
        mine AS (
          SELECT COALESCE(high_score_videos, 0::bigint) AS high_score_videos
          FROM ranked
          WHERE user_id = ${userId}
        )
        SELECT COUNT(*)::bigint AS ahead
        FROM ranked r
        CROSS JOIN mine m
        INNER JOIN users u ON u.id = r.user_id
        WHERE u.is_suspended = false
          AND u.role NOT IN ('TEACHER', 'ADMIN')
          AND r.user_id <> ${userId}
          AND r.high_score_videos > m.high_score_videos
      `
      .then((rows) => rows[0]);
  }
}
