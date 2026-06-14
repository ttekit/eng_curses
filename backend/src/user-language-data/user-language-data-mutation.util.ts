import type { Prisma } from "../generated/prisma/client";
import {
  aggregateSkillScore,
  clamp,
} from "src/alcorythm/alcorythm-scoring.util";
import type { PrismaService } from "src/prisma.service";

type LanguageDataRow = {
  id: number;
  topicId: number;
  score: number;
  listeningScore: number | null;
  vocabularyScore: number | null;
  grammarScore: number | null;
};

export type KnowledgeTopicUpdate = {
  topicId: number;
  previousScore: number;
  newScore: number;
};

type SkillDelta = {
  listening: number;
  vocabulary: number;
  grammar: number;
};

export async function applyListeningBumpToExistingTopics(
  prisma: PrismaService,
  userId: number,
  topicIds: number[],
  bump: number,
): Promise<void> {
  if (!topicIds.length) {
    return;
  }
  const rows = await prisma.userLanguageData.findMany({
    where: { userId, topicId: { in: topicIds } },
  });
  if (!rows.length) {
    return;
  }
  await prisma.$transaction(
    rows.map((row) => {
      const base = row.score;
      const nl = clamp((row.listeningScore ?? base) + bump);
      const nv = row.vocabularyScore ?? base;
      const ng = row.grammarScore ?? base;
      return prisma.userLanguageData.update({
        where: { id: row.id },
        data: {
          listeningScore: nl,
          score: aggregateSkillScore(nl, nv, ng),
        },
      });
    }),
  );
}

export async function applyUniformDeltaToLanguageRows(
  prisma: PrismaService,
  rows: LanguageDataRow[],
  dL: number,
  dV: number,
  dG: number,
): Promise<void> {
  if (!rows.length) {
    return;
  }
  await prisma.$transaction(
    rows.map((row) => {
      const base = row.score;
      const nl = clamp((row.listeningScore ?? base) + dL);
      const nv = clamp((row.vocabularyScore ?? base) + dV);
      const ng = clamp((row.grammarScore ?? base) + dG);
      return prisma.userLanguageData.update({
        where: { id: row.id },
        data: {
          listeningScore: nl,
          vocabularyScore: nv,
          grammarScore: ng,
          score: aggregateSkillScore(nl, nv, ng),
        },
      });
    }),
  );
}

export async function applySkillDeltasToTopics(
  prisma: PrismaService,
  userId: number,
  topicIds: number[],
  deltas: SkillDelta,
): Promise<KnowledgeTopicUpdate[]> {
  if (!topicIds.length) {
    return [];
  }
  const existing = await prisma.userLanguageData.findMany({
    where: { userId, topicId: { in: topicIds } },
  });
  const byTopicId = new Map(existing.map((row) => [row.topicId, row]));
  const knowledgeUpdates: KnowledgeTopicUpdate[] = [];
  const operations: Prisma.PrismaPromise<unknown>[] = [];
  for (const topicId of topicIds) {
    const row = byTopicId.get(topicId);
    const base = row?.score ?? 0;
    const prevListening = row?.listeningScore ?? base;
    const prevVocabulary = row?.vocabularyScore ?? base;
    const prevGrammar = row?.grammarScore ?? base;
    const newListening = clamp(prevListening + deltas.listening);
    const newVocabulary = clamp(prevVocabulary + deltas.vocabulary);
    const newGrammar = clamp(prevGrammar + deltas.grammar);
    const newScore = aggregateSkillScore(
      newListening,
      newVocabulary,
      newGrammar,
    );
    knowledgeUpdates.push({
      topicId,
      previousScore: row?.score ?? base,
      newScore: Math.round(1000 * newScore) / 1000,
    });
    if (row) {
      operations.push(
        prisma.userLanguageData.update({
          where: { id: row.id },
          data: {
            listeningScore: newListening,
            vocabularyScore: newVocabulary,
            grammarScore: newGrammar,
            score: newScore,
          },
        }),
      );
    } else {
      operations.push(
        prisma.userLanguageData.create({
          data: {
            userId,
            topicId,
            score: newScore,
            listeningScore: newListening,
            vocabularyScore: newVocabulary,
            grammarScore: newGrammar,
            confidence: 0.2,
            coverage: 0.1,
            algorithmVersion: "v2",
          },
        }),
      );
    }
  }
  if (operations.length) {
    await prisma.$transaction(operations);
  }
  return knowledgeUpdates;
}
