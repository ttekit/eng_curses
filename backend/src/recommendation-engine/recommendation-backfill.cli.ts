import "dotenv/config";
import { PrismaService } from "src/prisma.service";
import { update_segment_recommendation_fields } from "src/recommendation-engine/segment-vector.util";
import { LearnerProfileService } from "src/recommendation-engine/learner-profile.service";

async function backfill_segments(prisma: PrismaService): Promise<number> {
  const segments = await prisma.videoSegment.findMany({
    include: { lemmas: { include: { lemma: true } } },
  });
  let updated = 0;
  for (const segment of segments) {
    const words = segment.lemmas.map((link) => link.lemma.word);
    await update_segment_recommendation_fields(prisma, segment.id, {
      fullPhrase: segment.fullPhrase,
      difficultyLevel: segment.difficultyLevel,
      words,
    });
    updated += 1;
  }
  return updated;
}

async function migrate_lemma_progress(prisma: PrismaService): Promise<number> {
  const rows = await prisma.userLemmaProgress.findMany({
    include: { lemma: true },
  });
  let migrated = 0;
  for (const row of rows) {
    await prisma.learnerEngineProfile.upsert({
      where: { userId: row.userId },
      create: {
        userId: row.userId,
        proficiencyLevel: 2,
        knownWords: [],
      },
      update: {},
    });
    await prisma.userWordMemory.upsert({
      where: {
        userId_word: { userId: row.userId, word: row.lemma.word },
      },
      create: {
        userId: row.userId,
        word: row.lemma.word,
        memoryStrength: Math.max(row.stability, 1),
        lastSeenAt: row.lastReviewedAt ?? row.nextReviewAt,
      },
      update: {
        memoryStrength: Math.max(row.stability, 1),
        lastSeenAt: row.lastReviewedAt ?? row.nextReviewAt,
      },
    });
    migrated += 1;
  }
  return migrated;
}

async function seed_profiles(
  prisma: PrismaService,
  profileService: LearnerProfileService,
): Promise<number> {
  const users = await prisma.user.findMany({ select: { id: true } });
  let seeded = 0;
  for (const user of users) {
    await profileService.ensure_profile(user.id);
    seeded += 1;
  }
  return seeded;
}

async function run(): Promise<void> {
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const profileService = new LearnerProfileService(prisma);
  try {
    const segmentsUpdated = await backfill_segments(prisma);
    const memoriesMigrated = await migrate_lemma_progress(prisma);
    const profilesSeeded = await seed_profiles(prisma, profileService);
    console.log(
      JSON.stringify({ segmentsUpdated, memoriesMigrated, profilesSeeded }, null, 2),
    );
  } finally {
    await prisma.onModuleDestroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
