import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { LearnerProfileService } from "src/recommendation-engine/learner-profile.service";
import {
  apply_click_penalty,
  apply_complete_review,
  INITIAL_MEMORY_STRENGTH,
  should_promote_to_known,
} from "src/recommendation-engine/memory-strength.util";
import { days_since } from "src/recommendation-engine/recommendation-scoring.util";

export type ProgressInteractInput = {
  userId: number;
  wordId: number;
  isCorrect: boolean;
  timeSinceLastReview: number;
};

export type ProgressDto = {
  wordId: number;
  word: string;
  memoryStrength: number;
  lastSeenAt: string;
  isKnown: boolean;
};

@Injectable()
export class SpacedRepetitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learnerProfileService: LearnerProfileService,
  ) {}

  async interact(input: ProgressInteractInput): Promise<ProgressDto> {
    const lemma = await this.prisma.lemma.findUnique({
      where: { id: input.wordId },
    });
    if (!lemma) {
      throw new NotFoundException(`Lemma ${input.wordId} not found`);
    }
    await this.learnerProfileService.ensure_profile(input.userId);
    const word = lemma.word.toLowerCase();
    const existing = await this.prisma.userWordMemory.findUnique({
      where: { userId_word: { userId: input.userId, word } },
    });
    const now = new Date();
    if (!input.isCorrect) {
      const memoryStrength = apply_click_penalty(
        existing?.memoryStrength ?? INITIAL_MEMORY_STRENGTH,
      );
      const saved = await this.prisma.userWordMemory.upsert({
        where: { userId_word: { userId: input.userId, word } },
        create: {
          userId: input.userId,
          word,
          memoryStrength,
          lastSeenAt: now,
        },
        update: { memoryStrength, lastSeenAt: now },
      });
      return this.to_dto(saved, lemma.id, false);
    }
    const deltaT = Math.max(input.timeSinceLastReview / 86400, 0.01);
    const memoryStrength = apply_complete_review(
      existing?.memoryStrength ?? INITIAL_MEMORY_STRENGTH,
      deltaT,
    );
    if (should_promote_to_known(memoryStrength)) {
      await this.promote_word(input.userId, word);
      return {
        wordId: lemma.id,
        word,
        memoryStrength,
        lastSeenAt: now.toISOString(),
        isKnown: true,
      };
    }
    const saved = await this.prisma.userWordMemory.upsert({
      where: { userId_word: { userId: input.userId, word } },
      create: {
        userId: input.userId,
        word,
        memoryStrength,
        lastSeenAt: now,
      },
      update: { memoryStrength, lastSeenAt: now },
    });
    return this.to_dto(saved, lemma.id, false);
  }

  async get_due_count(userId: number): Promise<number> {
    const lexicon = await this.learnerProfileService.load_lexicon(userId);
    const nowMs = Date.now();
    let count = 0;
    for (const memory of lexicon.learningWords.values()) {
      const score = 1 - Math.exp(-days_since(memory.lastSeenAt, nowMs) / memory.memoryStrength);
      if (score >= 0.5) {
        count += 1;
      }
    }
    return count;
  }

  private async promote_word(userId: number, word: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.userWordMemory.deleteMany({ where: { userId, word } });
      const profile = await tx.learnerEngineProfile.findUnique({
        where: { userId },
      });
      const knownWords = profile?.knownWords ?? [];
      if (!knownWords.includes(word)) {
        await tx.learnerEngineProfile.update({
          where: { userId },
          data: { knownWords: [...knownWords, word] },
        });
      }
    });
  }

  private to_dto(
    row: { memoryStrength: number; lastSeenAt: Date; word: string },
    wordId: number,
    isKnown: boolean,
  ): ProgressDto {
    return {
      wordId,
      word: row.word,
      memoryStrength: row.memoryStrength,
      lastSeenAt: row.lastSeenAt.toISOString(),
      isKnown,
    };
  }
}
