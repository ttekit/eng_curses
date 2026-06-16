import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { phaseCountFromStoredPhases } from 'src/content-video/studying-plan-phase-progress.util';
import {
  blendCefrUnits,
  blendedVideoTopicKnowledge,
  buildUserThemeTokens,
  cefrBandFit,
  genrePreferenceFit,
  phaseTopicsFit,
  processingComplexityFit,
  videoSystemTagsToCefrUnit,
  userEnglishLevelToCefrUnit,
  userThemeMatchScore,
  topicKnowledgeFit,
  targetProcessingComplexity,
  vocabularyStrengthFromTopicScores,
} from './content-recommendation.scoring';
import {
  isUserEligibleForVideoAge,
  resolveUserAgeYears,
} from './content-recommendation-age.util';
import {
  compareRecommendationPriority,
  encodePriorityScore,
} from './content-recommendation-ranking.util';
import { parseStudyingPlanV2OrNull } from 'src/studying-plan/studying-plan-json.util';
import { expectedCefrLevelForPhase } from 'src/studying-plan/studying-plan-cefr.util';

export type UserRecommendationProfileDto = {
  cefrUnit: number;
  targetCefrUnit: number;
  cefrSource: string | null;
  vocabularyStrength: number;
  listeningStrength: number;
  targetProcessingComplexity: number;
  themeTokenSample: string[];
  topicRows: number;
  activePhaseIndex: number;
  phaseTopicNames: string[];
  favoriteGenreSample: string[];
  userAgeYears: number | null;
};

export type VideoRecommendationItemDto = {
  rank: number;
  score: number;
  breakdown: {
    cefr: number;
    complexity: number;
    themes: number;
    topicKnowledge: number;
    phaseTopics: number;
    genres: number;
  };
  contentVideo: {
    id: number;
    contentId: number;
    videoName: string;
    videoDescription: string | null;
    videoLink: string;
    hasCaptions: boolean;
    ageRestriction: string;
  };
  content: {
    name: string;
    description: string;
    friendlyLink: string;
  };
  stats: {
    systemTags: string[];
    userTags: string[];
    processingComplexity: number | null;
  } | null;
};

export type ContentRecommendationsResponse = {
  user: UserRecommendationProfileDto;
  recommendations: VideoRecommendationItemDto[];
};

@Injectable()
export class ContentRecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendationsForUser(userId: number): Promise<ContentRecommendationsResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        additionalUserData: {
          include: {
            selectedTopics: {
              include: { tags: { select: { name: true } } },
            },
            favoriteGenres: { select: { name: true } },
            hatedGenres: { select: { name: true } },
          },
        },
        languageData: {
          include: {
            topic: { include: { tags: { select: { name: true } } } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const profile = user.additionalUserData;
    const englishLabel = profile?.englishLevel?.trim() ?? null;
    const userCefrUnit = userEnglishLevelToCefrUnit(englishLabel);

    const plan = parseStudyingPlanV2OrNull(profile?.studyingPlanPhases);
    const phaseCount = phaseCountFromStoredPhases(profile?.studyingPlanPhases, 4);
    const activePhaseIndex = Math.min(
      Math.max(0, profile?.activeStudyingPhaseIndex ?? 0),
      Math.max(0, phaseCount - 1),
    );
    const activePhase = plan?.phases[activePhaseIndex];
    const phaseTopicRefs = activePhase?.topics ?? [];
    const phaseTopicIds = phaseTopicRefs.map((t) => t.id);
    const phaseTopicNames = phaseTopicRefs.map((t) => t.name);

    const phaseLevelLabel =
      activePhase?.expectedLevel?.trim() ||
      (englishLabel ?
        expectedCefrLevelForPhase(englishLabel, activePhaseIndex, phaseCount)
      : expectedCefrLevelForPhase('A2', activePhaseIndex, phaseCount));
    const phaseCefrUnit = userEnglishLevelToCefrUnit(phaseLevelLabel);
    const targetCefrUnit = blendCefrUnits(userCefrUnit, phaseCefrUnit);

    const phaseTopicTagNames: string[] = [];
    if (phaseTopicIds.length > 0) {
      const phaseTopicsFromDb = await this.prisma.topic.findMany({
        where: { id: { in: phaseTopicIds } },
        include: { tags: { select: { name: true } } },
      });
      for (const topic of phaseTopicsFromDb) {
        for (const tag of topic.tags) {
          phaseTopicTagNames.push(tag.name);
        }
      }
    }

    const favoriteGenreNames =
      profile?.favoriteGenres?.map((g) => g.name) ?? [];
    const hatedGenreNames = profile?.hatedGenres?.map((g) => g.name) ?? [];

    const vocabScores = user.languageData.map((ld) => ld.vocabularyScore);
    const listenScores = user.languageData.map((ld) => ld.listeningScore);
    const vocabStrength = vocabularyStrengthFromTopicScores(
      vocabScores,
      userCefrUnit,
    );
    const listenStrength = vocabularyStrengthFromTopicScores(
      listenScores,
      userCefrUnit,
    );
    const loadStrength =
      vocabScores.length || listenScores.length
        ? 0.45 * vocabStrength + 0.55 * listenStrength
        : vocabStrength;

    const targetPc = targetProcessingComplexity(targetCefrUnit, loadStrength);

    const strongTopicTagNames: string[] = [];
    for (const ld of user.languageData) {
      const peak = Math.max(
        ld.listeningScore,
        ld.vocabularyScore,
        ld.grammarScore,
      );
      if (peak < 0.45) {
        continue;
      }
      for (const tag of ld.topic.tags) {
        strongTopicTagNames.push(tag.name);
      }
    }

    const selectedTopicNames =
      profile?.selectedTopics?.map((t) => t.name) ?? [];

    const userTokens = buildUserThemeTokens({
      hobbies: profile?.hobbies ?? [],
      interests: profile?.interests ?? [],
      workField: profile?.workField ?? null,
      education: profile?.education ?? null,
      job: profile?.job ?? null,
      selectedTopicNames,
      strongTopicTagNames,
      favoriteGenreNames,
    });

    const topicIdToUserScore = new Map(
      user.languageData.map((ld) => [
        ld.topicId,
        blendedVideoTopicKnowledge(
          ld.listeningScore,
          ld.vocabularyScore,
          ld.grammarScore,
        ),
      ]),
    );

    const userAgeYears = resolveUserAgeYears({
      dateOfBirth: user.dateOfBirth,
      role: user.role,
    });

    const videos = await this.prisma.contentVideo.findMany({
      orderBy: { id: "asc" },
      include: {
        videoCaption: { select: { id: true } },
        content: {
          include: {
            category: {
              select: { name: true, description: true, friendlyLink: true },
            },
            stats: {
              include: {
                topics: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    const scored: VideoRecommendationItemDto[] = [];
    for (const v of videos) {
      if (!isUserEligibleForVideoAge(userAgeYears, v.ageRestriction)) {
        continue;
      }

      const stats = v.content?.stats;
      const videoCefr = stats
        ? videoSystemTagsToCefrUnit(stats.systemTags)
        : 0.4;
      const vComplexity = stats?.processingComplexity ?? null;
      const videoUserTags = stats?.userTags ?? [];

      const cefr = cefrBandFit(targetCefrUnit, videoCefr);
      const complexity = processingComplexityFit(vComplexity, targetPc);
      const themes = userThemeMatchScore(videoUserTags, userTokens);
      const topicIds = stats?.topics.map((t) => t.id) ?? [];
      const topicKnow = topicKnowledgeFit(topicIds, topicIdToUserScore);
      const phaseTopics = phaseTopicsFit(
        topicIds,
        phaseTopicIds,
        phaseTopicNames,
        phaseTopicTagNames,
        videoUserTags,
      );
      const genres = genrePreferenceFit(
        videoUserTags,
        favoriteGenreNames,
        hatedGenreNames,
      );

      const parts = {
        cefr,
        complexity,
        themes,
        topicKnowledge: topicKnow,
        phaseTopics,
        genres,
      };
      const score = encodePriorityScore(parts);

      scored.push({
        rank: 0,
        score,
        breakdown: parts,
        contentVideo: {
          id: v.id,
          contentId: v.contentId,
          videoName: v.videoName,
          videoDescription: v.videoDescription,
          videoLink: v.videoLink,
          hasCaptions: Boolean(v.videoCaption),
          ageRestriction: v.ageRestriction,
        },
        content: {
          name: v.content.category.name,
          description: v.content.category.description,
          friendlyLink: v.content.category.friendlyLink,
        },
        stats: stats
          ? {
              systemTags: stats.systemTags,
              userTags: stats.userTags,
              processingComplexity: stats.processingComplexity,
            }
          : null,
      });
    }

    scored.sort((left, right) => {
      const priority = compareRecommendationPriority(
        left.breakdown,
        right.breakdown,
      );
      if (priority !== 0) {
        return priority;
      }
      return left.contentVideo.id - right.contentVideo.id;
    });
    for (let i = 0; i < scored.length; i++) {
      scored[i].rank = i + 1;
    }

    const themeSample = [...userTokens].slice(0, 12);

    return {
      user: {
        cefrUnit: userCefrUnit,
        targetCefrUnit,
        cefrSource: englishLabel,
        vocabularyStrength: vocabStrength,
        listeningStrength: listenStrength,
        targetProcessingComplexity: targetPc,
        themeTokenSample: themeSample,
        topicRows: user.languageData.length,
        activePhaseIndex,
        phaseTopicNames,
        favoriteGenreSample: favoriteGenreNames.slice(0, 8),
        userAgeYears,
      },
      recommendations: scored.slice(0, 40),
    };
  }
}
