import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  cefr_to_proficiency_level,
  hash_embed,
} from "./hash-embedding.util";
import type {
  LearnerLexicon,
  LearnerProfileState,
  Vector384,
} from "./recommendation.types";

@Injectable()
export class LearnerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async ensure_profile(userId: number): Promise<LearnerProfileState> {
    const existing = await this.prisma.learnerEngineProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return this.to_state(existing);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        additionalUserData: {
          include: {
            favoriteGenres: { select: { name: true } },
            selectedTopics: { select: { name: true } },
          },
        },
      },
    });
    const proficiencyLevel = cefr_to_proficiency_level(
      user?.additionalUserData?.englishLevel,
    );
    const interestsVector = [...hash_embed(this.build_interests_text(user?.additionalUserData))];
    const created = await this.prisma.learnerEngineProfile.create({
      data: {
        userId,
        proficiencyLevel,
        targetAccent: "general-american",
        knownWords: [],
        interestsVector,
      },
    });
    return this.to_state(created);
  }

  async load_profile(userId: number): Promise<LearnerProfileState> {
    const profile = await this.prisma.learnerEngineProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return this.ensure_profile(userId);
    }
    return this.to_state(profile);
  }

  async load_lexicon(userId: number): Promise<LearnerLexicon> {
    const profile = await this.load_profile(userId);
    const memories = await this.prisma.userWordMemory.findMany({
      where: { userId },
    });
    const learningWords = new Map(
      memories.map((row) => [
        row.word,
        {
          word: row.word,
          lastSeenAt: row.lastSeenAt,
          memoryStrength: row.memoryStrength,
        },
      ]),
    );
    return {
      knownWords: new Set(profile.knownWords),
      learningWords,
    };
  }

  private to_state(profile: {
    userId: number;
    proficiencyLevel: number;
    targetAccent: string;
    interestsVector: number[];
    knownWords: string[];
  }): LearnerProfileState {
    return {
      userId: profile.userId,
      proficiencyLevel: profile.proficiencyLevel,
      targetAccent: profile.targetAccent,
      interestsVector: profile.interestsVector.length
        ? (profile.interestsVector as Vector384)
        : null,
      knownWords: profile.knownWords,
    };
  }

  private build_interests_text(
    data:
      | {
          hobbies: string[];
          favoriteGenres: Array<{ name: string }>;
          selectedTopics: Array<{ name: string }>;
        }
      | null
      | undefined,
  ): string {
    if (!data) {
      return "general english learning";
    }
    return [
      ...data.hobbies,
      ...data.favoriteGenres.map((genre) => genre.name),
      ...data.selectedTopics.map((topic) => topic.name),
    ].join(" ");
  }
}
