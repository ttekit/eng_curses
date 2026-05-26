import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from 'src/prisma.service';
import { AlcorythmGeminiTagScoreClient } from './alcorythm-gemini-tag-score.client';
import { TagKnowledgeItem, TopicKnowledgeItem } from './alcorythm.types';
import {
  AI_ALGORITHM_VERSION,
  buildProfileContext,
  calculateConfidence,
  clamp,
  computeTopicKnowledgePrior,
  getDeterministicTagScore,
  keywordMatchStrength,
  normalizeKeywords,
} from './alcorythm-scoring.util';

@Injectable()
export class AlcorythmService {
  private readonly logger = new Logger(AlcorythmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiTagScoreClient: AlcorythmGeminiTagScoreClient,
  ) {}

  async analyzeUserLevel(userId: number): Promise<TopicKnowledgeItem[]> {
    const prisma = this.prisma as any;

    let user: any;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          additionalUserData: {
            include: {
              selectedTopics: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2021') {
        return [];
      }
      throw error;
    }

    if (!user) {
      return [];
    }

    const topics = await prisma.topic.findMany({
      include: {
        tags: true,
      },
    });

    if (!topics.length) {
      await prisma.userLanguageData.deleteMany({
        where: { userId },
      });
      return [];
    }

    const profile = user.additionalUserData;
    if (!profile) {
      return [];
    }

    const profileContext = buildProfileContext(profile);
    const primaryKeywords = normalizeKeywords([
      profileContext.workField,
      profileContext.education,
      profileContext.job,
    ]);
    const secondaryKeywords = normalizeKeywords(profileContext.hobbies ?? []);

    const confidence = calculateConfidence({
      hasEnglishLevel: Boolean(profileContext.englishLevel),
      hasLanguageBackground:
        Boolean(profileContext.nativeLanguage) ||
        profileContext.knownLanguages.length > 0 ||
        profileContext.knownLanguageLevels.length > 0,
      hasPrimarySignals: primaryKeywords.length > 0,
      hasSecondarySignals: secondaryKeywords.length > 0,
      hasSelectedTopics: profileContext.selectedTopicIds.size > 0,
    });

    const measuredTopicIds = await this.loadMeasuredTopicIds(userId);
    const existingRows = await prisma.userLanguageData.findMany({
      where: { userId },
    });
    const existingByTopicId = new Map<number, (typeof existingRows)[number]>(
      existingRows.map((row: (typeof existingRows)[number]) => [row.topicId, row]),
    );

    const items = topics.map((topic: any) => {
      if (measuredTopicIds.has(topic.id) && existingByTopicId.has(topic.id)) {
        const row = existingByTopicId.get(topic.id)!;
        return {
          topicId: topic.id,
          score: row.score,
          listeningScore: row.listeningScore,
          vocabularyScore: row.vocabularyScore,
          grammarScore: row.grammarScore,
          confidence: row.confidence,
          coverage: row.coverage,
          algorithmVersion: row.algorithmVersion,
          preserve: true as const,
        };
      }

      const tagNames = topic.tags.map((tag: { name: string }) => tag.name);
      const primaryStrength = keywordMatchStrength(
        topic.name,
        tagNames,
        primaryKeywords,
      );
      const secondaryStrength = keywordMatchStrength(
        topic.name,
        tagNames,
        secondaryKeywords,
      );
      const prior = computeTopicKnowledgePrior({
        profile: profileContext,
        topicName: topic.name,
        tagNames,
        topicComplexity: topic.complexity ?? 5,
        primaryStrength,
        secondaryStrength,
        isSelectedTopic: profileContext.selectedTopicIds.has(topic.id),
        confidence,
      });

      return {
        topicId: topic.id,
        score: prior.score,
        listeningScore: prior.listeningScore,
        vocabularyScore: prior.vocabularyScore,
        grammarScore: prior.grammarScore,
        confidence: prior.confidence,
        coverage: prior.coverage,
        algorithmVersion: AI_ALGORITHM_VERSION,
        preserve: false as const,
      };
    });

    for (const item of items) {
      if (item.preserve) {
        continue;
      }
      await prisma.userLanguageData.upsert({
        where: {
          userId_topicId: { userId, topicId: item.topicId },
        },
        create: {
          userId,
          topicId: item.topicId,
          score: item.score,
          listeningScore: item.listeningScore,
          vocabularyScore: item.vocabularyScore,
          grammarScore: item.grammarScore,
          confidence: item.confidence,
          coverage: item.coverage,
          algorithmVersion: item.algorithmVersion,
        },
        update: {
          score: item.score,
          listeningScore: item.listeningScore,
          vocabularyScore: item.vocabularyScore,
          grammarScore: item.grammarScore,
          confidence: item.confidence,
          coverage: item.coverage,
          algorithmVersion: item.algorithmVersion,
        },
      });
    }

    void this.analizeUsersLevel(userId).catch(() => {});

    return items.map(({ preserve: _preserve, ...rest }) => rest);
  }

  /** Topic ids linked to videos the learner has attempted (quiz evidence). */
  private async loadMeasuredTopicIds(userId: number): Promise<Set<number>> {
    const attempts = await this.prisma.comprehensionTestAttempt.findMany({
      where: { userId },
      select: {
        contentVideo: {
          select: {
            content: {
              select: {
                stats: {
                  select: {
                    topics: { select: { id: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    const measured = new Set<number>();
    for (const attempt of attempts) {
      const topics =
        attempt.contentVideo?.content?.stats?.topics ?? [];
      for (const topic of topics) {
        measured.add(topic.id);
      }
    }
    return measured;
  }

  async analizeUsersLevel(userId: number): Promise<TagKnowledgeItem[]> {
    const prisma = this.prisma as any;

    let user: any;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          additionalUserData: {
            include: {
              selectedTopics: {
                include: {
                  tags: true,
                },
              },
            },
          },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2021') {
        return [];
      }
      throw error;
    }

    const profile = user?.additionalUserData;
    if (!profile) {
      return [];
    }

    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        topics: {
          select: {
            id: true,
            name: true,
            complexity: true,
          },
        },
      },
    });

    const profileContext = buildProfileContext(profile);
    const primaryKeywords = normalizeKeywords([
      profileContext.workField,
      profileContext.education,
      profileContext.job,
    ]);
    const secondaryKeywords = normalizeKeywords(profileContext.hobbies);
    const confidence = calculateConfidence({
      hasEnglishLevel: Boolean(profileContext.englishLevel),
      hasLanguageBackground:
        Boolean(profileContext.nativeLanguage) ||
        profileContext.knownLanguages.length > 0 ||
        profileContext.knownLanguageLevels.length > 0,
      hasPrimarySignals: primaryKeywords.length > 0,
      hasSecondarySignals: secondaryKeywords.length > 0,
      hasSelectedTopics: profileContext.selectedTopicIds.size > 0,
    });

    const deterministicByTag: Record<string, number> = {};
    for (const tag of tags) {
      deterministicByTag[tag.name] = getDeterministicTagScore({
        profile: profileContext,
        tagName: tag.name,
        topics: (tag.topics ?? []).map((topic: { id: number; name: string; complexity: number }) => ({
          id: topic.id,
          name: topic.name,
          complexity: topic.complexity ?? 2,
        })),
        primaryKeywords,
        secondaryKeywords,
        confidence,
      });
    }

    const geminiScores = await this.geminiTagScoreClient.scoreTags({
      tagNames: tags.map((tag: any) => tag.name),
      englishLevel: profileContext.englishLevel,
      nativeLanguage: profileContext.nativeLanguage,
      knownLanguages: profileContext.knownLanguages,
      knownLanguageLevels: profileContext.knownLanguageLevels,
      education: profileContext.education,
      workField: profileContext.workField,
      job: profileContext.job,
      hobbies: profileContext.hobbies,
      selectedTopicNames: profileContext.selectedTopicNames,
      deterministicScores: deterministicByTag,
    });

    const result = tags.map((tag: any) => ({
      tag: tag.name,
      level: clamp(geminiScores?.[tag.name] ?? deterministicByTag[tag.name]),
    }));

    return result;
  }
}
