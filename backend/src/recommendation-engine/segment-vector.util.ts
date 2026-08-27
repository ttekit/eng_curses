import type { PrismaService } from "src/prisma.service";
import { hash_embed, cefr_to_proficiency_level } from "./hash-embedding.util";
import type { Vector384 } from "./recommendation.types";

export async function update_segment_recommendation_fields(
  prisma: PrismaService,
  segmentId: number,
  input: {
    fullPhrase: string;
    difficultyLevel: string | null;
    words: string[];
  },
): Promise<void> {
  const vector = [...hash_embed(input.fullPhrase)];
  const proficiencyLevel = cefr_to_proficiency_level(input.difficultyLevel);
  await prisma.videoSegment.update({
    where: { id: segmentId },
    data: {
      words: input.words,
      proficiencyLevel,
      contextVector: vector,
      accent: "general-american",
    },
  });
}

export async function read_segment_vector(
  prisma: PrismaService,
  segmentId: number,
): Promise<Vector384 | null> {
  const segment = await prisma.videoSegment.findUnique({
    where: { id: segmentId },
    select: { contextVector: true },
  });
  if (!segment?.contextVector?.length) {
    return null;
  }
  return segment.contextVector as Vector384;
}
