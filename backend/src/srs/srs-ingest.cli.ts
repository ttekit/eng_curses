import "dotenv/config";
import { PrismaService } from "src/prisma.service";
import { SubtitleIngestionService } from "src/srs/subtitle-ingestion.service";

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const videoArg = args.find((arg) => arg.startsWith("--videoId="));
  const allMissing = args.includes("--all-missing");
  const reingestAll = args.includes("--reingest-all");
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const ingestion = new SubtitleIngestionService(prisma);
  try {
    if (reingestAll) {
      const result = await ingestion.ingest_all_with_captions();
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (allMissing) {
      const result = await ingestion.ingest_all_missing();
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    const videoId = Number.parseInt(videoArg?.split("=")[1] ?? "", 10);
    if (!Number.isFinite(videoId) || videoId <= 0) {
      throw new Error(
        "Usage: npm run srs:ingest -- --videoId=123 | --all-missing | --reingest-all",
      );
    }
    const result = await ingestion.ingest_for_video(videoId);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.onModuleDestroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
