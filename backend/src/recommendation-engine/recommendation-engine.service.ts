import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import type { FeedSegmentDto } from "src/srs/feed.types";
import { fetch_context_shift_candidates } from "./context-shift.queries";
import { load_feed_freshness_context } from "./feed-freshness.util";
import { fill_feed_slots } from "./feed-slot.util";
import { build_exploration_feed_dtos } from "./feed-empty-fallback.util";
import { LearnerProfileService } from "./learner-profile.service";
import {
  apply_click_penalty,
  apply_complete_review,
  INITIAL_MEMORY_STRENGTH,
  is_watch_complete,
  is_watch_skip,
  should_promote_to_known,
} from "./memory-strength.util";
import type {
  ContextShiftResult,
  WatchFeedbackResult,
} from "./recommendation.types";
import { days_since } from "./recommendation-scoring.util";
import {
  enrich_to_feed_dtos,
  rank_context_shift_candidates,
} from "./segment-enrichment.util";
import { read_segment_vector } from "./segment-vector.util";
import {
  resolve_new_target_word,
  resolve_review_target_word,
} from "./feed-target-word.util";
import { filter_learnable_words } from "src/srs/proper-noun.util";

export type GenerateFeedOptions = {
  excludeSegmentIds?: number[];
};

@Injectable()
export class RecommendationEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learnerProfileService: LearnerProfileService,
  ) {}

  async generate_feed(
    userId: number,
    limit = 10,
    options?: GenerateFeedOptions,
  ): Promise<FeedSegmentDto[]> {
    const profile = await this.learnerProfileService.load_profile(userId);
    const lexicon = await this.learnerProfileService.load_lexicon(userId);
    const freshness = await load_feed_freshness_context(this.prisma, userId);
    const sessionExclude = options?.excludeSegmentIds ?? [];
    const poolSize = Math.max(limit * 4, 24);
    let selected = await fill_feed_slots({
      prisma: this.prisma,
      profile,
      lexicon,
      interestsVector: profile.interestsVector,
      freshness,
      excludeIds: sessionExclude,
      limit: poolSize,
    });
    let dtos = await enrich_to_feed_dtos(this.prisma, userId, selected);
    if (dtos.length < limit) {
      const exclude = [
        ...sessionExclude,
        ...selected.map((item) => item.segmentId),
      ];
      const recycled = await fill_feed_slots({
        prisma: this.prisma,
        profile,
        lexicon,
        interestsVector: profile.interestsVector,
        freshness,
        excludeIds: exclude,
        limit: poolSize,
      });
      const recycledDtos = await enrich_to_feed_dtos(
        this.prisma,
        userId,
        recycled,
      );
      const seen = new Set(dtos.map((item) => item.segmentId));
      for (const item of recycledDtos) {
        if (seen.has(item.segmentId)) {
          continue;
        }
        dtos.push(item);
        seen.add(item.segmentId);
      }
    }
    if (dtos.length === 0) {
      dtos = await build_exploration_feed_dtos(this.prisma, userId, {
        profile,
        lexicon,
        freshness,
        excludeIds: sessionExclude,
        limit,
      });
    }
    return dtos.slice(0, limit);
  }

  async handle_context_shift(
    userId: number,
    currentSegmentId: number,
    clickedWord: string,
  ): Promise<ContextShiftResult> {
    const normalizedWord = clickedWord.trim().toLowerCase();
    const profile = await this.learnerProfileService.load_profile(userId);
    const existing = await this.prisma.userWordMemory.findUnique({
      where: { userId_word: { userId, word: normalizedWord } },
    });
    const penalizedStrength = apply_click_penalty(
      existing?.memoryStrength ?? INITIAL_MEMORY_STRENGTH,
    );
    await this.prisma.$transaction(async (tx) => {
      await tx.userWordMemory.upsert({
        where: { userId_word: { userId, word: normalizedWord } },
        create: {
          userId,
          word: normalizedWord,
          memoryStrength: penalizedStrength,
          lastSeenAt: new Date(),
        },
        update: {
          memoryStrength: penalizedStrength,
          lastSeenAt: new Date(),
        },
      });
      if (profile.knownWords.includes(normalizedWord)) {
        await tx.learnerEngineProfile.update({
          where: { userId },
          data: {
            knownWords: profile.knownWords.filter(
              (word) => word !== normalizedWord,
            ),
          },
        });
      }
    });
    const currentVector = await read_segment_vector(
      this.prisma,
      currentSegmentId,
    );
    const rows = await fetch_context_shift_candidates(this.prisma, {
      currentSegmentId,
      clickedWord: normalizedWord,
      knownWords: profile.knownWords,
      limit: 50,
    });
    const ranked = rank_context_shift_candidates(rows, {
      profile,
      currentVector,
      interestsVector: profile.interestsVector,
    });
    const top = ranked[0];
    if (!top) {
      return { nextSegment: null, penalizedWord: normalizedWord };
    }
    const [nextSegment] = await enrich_to_feed_dtos(this.prisma, userId, [top], {
      targetWordBySegmentId: new Map([[top.segmentId, normalizedWord]]),
    });
    return { nextSegment: nextSegment ?? null, penalizedWord: normalizedWord };
  }

  async process_watch_feedback(
    userId: number,
    segmentId: number,
    watchTimeSec: number,
    loopLengthSec: number,
  ): Promise<WatchFeedbackResult> {
    if (is_watch_skip(watchTimeSec)) {
      return { updatedWords: [], promotedWords: [], skipped: true };
    }
    if (!is_watch_complete(watchTimeSec, loopLengthSec)) {
      return { updatedWords: [], promotedWords: [], skipped: true };
    }
    const segment = await this.prisma.videoSegment.findUnique({
      where: { id: segmentId },
    });
    if (!segment) {
      throw new NotFoundException(`Segment ${segmentId} not found`);
    }
    const lexicon = await this.learnerProfileService.load_lexicon(userId);
    const profile = await this.learnerProfileService.load_profile(userId);
    const learnableWords = filter_learnable_words(
      segment.words,
      segment.fullPhrase,
    );
    const targetWord =
      resolve_new_target_word(
        learnableWords,
        new Set(profile.knownWords),
        new Set(lexicon.learningWords.keys()),
      ) ??
      resolve_review_target_word(learnableWords, lexicon.learningWords) ??
      null;
    if (!targetWord) {
      return { updatedWords: [], promotedWords: [], skipped: true };
    }
    const learningWords = lexicon.learningWords.has(targetWord)
      ? [targetWord]
      : [];
    const updatedWords: string[] = [];
    const promotedWords: string[] = [];
    const now = new Date();
    for (const word of learningWords) {
      const memory = lexicon.learningWords.get(word);
      if (!memory) {
        continue;
      }
      const deltaT = days_since(memory.lastSeenAt, now.getTime());
      const newStrength = apply_complete_review(memory.memoryStrength, deltaT);
      if (should_promote_to_known(newStrength)) {
        await this.prisma.$transaction(async (tx) => {
          await tx.userWordMemory.delete({
            where: { userId_word: { userId, word } },
          });
          const row = await tx.learnerEngineProfile.findUnique({
            where: { userId },
          });
          const knownWords = row?.knownWords ?? [];
          if (!knownWords.includes(word)) {
            await tx.learnerEngineProfile.update({
              where: { userId },
              data: { knownWords: [...knownWords, word] },
            });
          }
        });
        promotedWords.push(word);
      } else {
        await this.prisma.userWordMemory.update({
          where: { userId_word: { userId, word } },
          data: { memoryStrength: newStrength, lastSeenAt: now },
        });
        updatedWords.push(word);
      }
    }
    return { updatedWords, promotedWords, skipped: false };
  }
}
