import "dotenv/config";
import * as bcrypt from "bcrypt";
import {
  AuthMethod,
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getDatabaseUrl } from "../src/config/database-url";
import { LEADERBOARD_DEMO_NAMES } from "./leaderboard-demo-names";
import {
  require_shuffled_leaderboard_avatars,
} from "./leaderboard-demo-avatars";
import {
  build_realistic_video_counts,
  pick_random_video_ids,
  resolve_random_cefr_level,
  resolve_random_quiz_score,
} from "./leaderboard-demo-stats";

const DEMO_EMAIL_DOMAIN = "leaderboard-demo.explys.local";
const DEMO_PASSWORD = "LeaderboardDemo1!";
const DEMO_USER_COUNT = 50;

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: false,
});
const adapter = new PrismaPg(pool as never);
const prisma = new PrismaClient({ adapter });

function resolve_demo_name(index: number): string {
  return LEADERBOARD_DEMO_NAMES[index] ?? `Learner ${index + 1}`;
}

async function seed_leaderboard_demo_users(): Promise<void> {
  const videos = await prisma.contentVideo.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });

  if (videos.length < 20) {
    throw new Error("Need at least 20 content videos to seed leaderboard demos.");
  }

  const videoIds = videos.map((row) => row.id);
  const videoTargets = build_realistic_video_counts(
    DEMO_USER_COUNT,
    videoIds.length,
  );

  const activeAvatars = await prisma.avatar.findMany({
    where: { isActive: true },
    select: { url: true },
    orderBy: { id: "asc" },
  });
  const activeAvatarUrls = activeAvatars.map((row) => row.url);
  const shuffledAvatarPool = require_shuffled_leaderboard_avatars(
    activeAvatarUrls,
    DEMO_USER_COUNT,
  );

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const completionDate = new Date();
  completionDate.setUTCHours(0, 0, 0, 0);

  console.log(
    `Using ${activeAvatarUrls.length} active avatars from local avatars table.`,
  );
  console.log(
    `Found ${videoIds.length} videos; seeding ${DEMO_USER_COUNT} demo users (20+ each)…`,
  );

  for (let rankIndex = 0; rankIndex < DEMO_USER_COUNT; rankIndex += 1) {
    const rankNumber = rankIndex + 1;
    const email = `leaderboard-${String(rankNumber).padStart(2, "0")}@${DEMO_EMAIL_DOMAIN}`;
    const name = resolve_demo_name(rankIndex);
    const videoTarget = videoTargets[rankIndex] ?? 20;
    const englishLevel = resolve_random_cefr_level();
    const xp = videoTarget * 120;
    const level = Math.floor(xp / 1000) + 1;
    const avatarUrl = shuffledAvatarPool[rankIndex];
    if (!avatarUrl) {
      throw new Error(`Missing avatar assignment for demo user #${rankNumber}.`);
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        password: passwordHash,
        avatarUrl,
        role: UserRole.ADULT,
        method: AuthMethod.CREDENTIALS,
        isVerified: true,
        hasCompletedPlacement: true,
        isSuspended: false,
        xp,
        level,
      },
      update: {
        name,
        password: passwordHash,
        avatarUrl,
        role: UserRole.ADULT,
        isVerified: true,
        hasCompletedPlacement: true,
        isSuspended: false,
        xp,
        level,
      },
    });

    await prisma.additionalUserData.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        englishLevel,
        hobbies: [],
        interests: [],
        knownLanguages: [],
      },
      update: { englishLevel },
    });

    await prisma.comprehensionTestAttempt.deleteMany({
      where: { userId: user.id },
    });
    await prisma.watchSession.deleteMany({ where: { userId: user.id } });

    const selectedVideoIds = pick_random_video_ids(videoIds, videoTarget);
    const totalQuestions = 10;

    for (const contentVideoId of selectedVideoIds) {
      const scorePct = resolve_random_quiz_score();
      const correctAnswers = Math.round((scorePct / 100) * totalQuestions);
      await prisma.watchSession.create({
        data: {
          userId: user.id,
          contentVideoId,
          completionDate,
          endedAt: new Date(),
          secondsWatched: 480 + Math.floor(Math.random() * 420),
          completed: true,
        },
      });
      await prisma.comprehensionTestAttempt.create({
        data: {
          userId: user.id,
          contentVideoId,
          correct: correctAnswers,
          total: totalQuestions,
          scorePct,
          passed: scorePct >= 70,
        },
      });
    }

    console.log(
      `  #${rankNumber} ${name}: ${videoTarget} videos · ${englishLevel}`,
    );
  }

  console.log("Done. Demo login: leaderboard-01@" + DEMO_EMAIL_DOMAIN);
  console.log("Password for all demo users:", DEMO_PASSWORD);
}

async function main(): Promise<void> {
  await seed_leaderboard_demo_users();
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Leaderboard seed failed:", message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
