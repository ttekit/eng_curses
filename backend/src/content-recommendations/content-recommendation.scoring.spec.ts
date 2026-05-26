import {
  blendCefrUnits,
  buildUserThemeTokens,
  cefrBandFit,
  genrePreferenceFit,
  phaseTopicsFit,
  totalWeightedScore,
  userEnglishLevelToCefrUnit,
} from './content-recommendation.scoring';

describe('content-recommendation.scoring', () => {
  describe('blendCefrUnits', () => {
    it('weights phase CEFR more than profile CEFR', () => {
      const user = userEnglishLevelToCefrUnit('A1');
      const phase = userEnglishLevelToCefrUnit('B1');
      const blended = blendCefrUnits(user, phase);
      expect(blended).toBeGreaterThan(user);
      expect(blended).toBeLessThan(phase);
    });
  });

  describe('cefrBandFit with blended target', () => {
    it('favors videos near blended phase+profile level', () => {
      const target = blendCefrUnits(
        userEnglishLevelToCefrUnit('A2'),
        userEnglishLevelToCefrUnit('B1'),
      );
      const near = cefrBandFit(target, target + 0.1);
      const far = cefrBandFit(target, target + 0.5);
      expect(near).toBeGreaterThan(far);
    });
  });

  describe('phaseTopicsFit', () => {
    it('returns 1 when video topic id matches active phase topic', () => {
      expect(phaseTopicsFit([10, 20], [20, 30], ['Travel'], [], [])).toBe(1);
    });

    it('returns neutral score when phase has no topics', () => {
      expect(phaseTopicsFit([1], [], [], [], [])).toBe(0.55);
    });

    it('soft-matches phase topic names on video userTags', () => {
      const fit = phaseTopicsFit(
        [],
        [99],
        ['Business English'],
        [],
        ['business', 'meetings'],
      );
      expect(fit).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('genrePreferenceFit', () => {
    it('boosts videos with favorite genre tags', () => {
      const withFav = genrePreferenceFit(
        ['Comedy', 'daily life'],
        ['Comedy'],
        [],
      );
      const without = genrePreferenceFit(
        ['Documentary'],
        ['Comedy'],
        [],
      );
      expect(withFav).toBeGreaterThan(without);
    });

    it('penalizes hated genre tags', () => {
      const hated = genrePreferenceFit(
        ['Horror'],
        [],
        ['Horror'],
      );
      const neutral = genrePreferenceFit(['Drama'], [], ['Horror']);
      expect(hated).toBeLessThan(neutral);
    });
  });

  describe('buildUserThemeTokens', () => {
    it('includes job and favorite genre names', () => {
      const tokens = buildUserThemeTokens({
        hobbies: ['football'],
        interests: [],
        workField: 'IT',
        education: null,
        job: 'Developer',
        selectedTopicNames: [],
        strongTopicTagNames: [],
        favoriteGenreNames: ['Comedy'],
      });
      expect(tokens.has('developer')).toBe(true);
      expect(tokens.has('comedy')).toBe(true);
      expect(tokens.has('it')).toBe(true);
    });
  });

  describe('totalWeightedScore', () => {
    it('includes phaseTopics and genres in the weighted sum', () => {
      const score = totalWeightedScore({
        cefr: 1,
        complexity: 1,
        themes: 1,
        topicKnowledge: 1,
        phaseTopics: 1,
        genres: 1,
      });
      expect(score).toBeCloseTo(1, 5);
    });
  });
});
