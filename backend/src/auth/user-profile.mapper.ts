import type { Prisma } from "@generated/prisma/client";
import { parsePhaseFinalTestProgress } from "src/phase-final-test/phase-final-test-progress.util";

export const userProfileInclude = {
  additionalUserData: {
    include: {
      favoriteGenres: true,
      hatedGenres: true,
    },
  },
  settings: true,
  teacher: {
    select: { name: true },
  },
  class: {
    select: { name: true },
  },
} as const satisfies Prisma.UserInclude;

export type UserProfileRecord = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

export type UserProfileResponse = {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | null;
  avatarUrl: string | null;
  isTwoFactorEnable: boolean;
  isVerified: boolean;
  role: string;
  xp: number;
  hasCompletedPlacement: boolean;
  currentStreak: number;
  englishLevel: string;
  education: string;
  workField: string;
  nativeLanguage: string;
  hobbies: string[];
  learningGoal: string;
  timeToAchieve: string;
  studyingPlanPhases: unknown;
  studyingPlanPhaseTopics: unknown;
  activeStudyingPhaseIndex: number;
  activePhaseEnteredAt: string | null;
  phaseFinalTestPassedPhases: number[];
  studyingPlanProgress: {
    distinctPassedVideos: number;
    vocabularyTermsTotal: number;
  };
  favoriteGenres: number[];
  hatedGenres: number[];
  playbackSpeed: number | null;
  videoQuality: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  stripeSubscriptionId: string;
  teacherId: number | null;
  teacherName: string | null;
  className: string | null;
};

export function compute_current_streak(
  currentStreak: number,
  lastActivityDate: Date | null | undefined,
  now = new Date(),
): number {
  if (!lastActivityDate || currentStreak <= 0) {
    return currentStreak;
  }
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const lastActivityDay = new Date(
    Date.UTC(
      lastActivityDate.getUTCFullYear(),
      lastActivityDate.getUTCMonth(),
      lastActivityDate.getUTCDate(),
    ),
  );
  const diffDays = Math.round(
    (today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays > 1 ? 0 : currentStreak;
}

export function map_user_profile_response(
  user: UserProfileRecord,
  extras: {
    distinctPassedVideos: number;
    vocabularyTermsTotal: number;
    studyingPlanPhaseTopics: unknown;
  },
): UserProfileResponse {
  const extra = user.additionalUserData;
  const activePhaseEnteredAt = extra?.activePhaseEnteredAt;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    avatarUrl: user.avatarUrl,
    isTwoFactorEnable: user.isTwoFactorEnable,
    isVerified: user.isVerified,
    role: user.role,
    xp: user.xp,
    hasCompletedPlacement: user.hasCompletedPlacement,
    currentStreak: compute_current_streak(
      user.currentStreak,
      user.lastActivityDate,
    ),
    englishLevel: extra?.englishLevel ?? "",
    education: extra?.education ?? "",
    workField: extra?.workField ?? "",
    nativeLanguage: extra?.nativeLanguage ?? "",
    hobbies: extra?.hobbies ?? [],
    learningGoal: extra?.learningGoal ?? "",
    timeToAchieve: extra?.timeToAchieve ?? "",
    studyingPlanPhases: extra?.studyingPlanPhases ?? null,
    studyingPlanPhaseTopics: extras.studyingPlanPhaseTopics,
    activeStudyingPhaseIndex: extra?.activeStudyingPhaseIndex ?? 0,
    activePhaseEnteredAt:
      activePhaseEnteredAt instanceof Date
        ? activePhaseEnteredAt.toISOString()
        : (activePhaseEnteredAt ?? null),
    phaseFinalTestPassedPhases: parsePhaseFinalTestProgress(
      extra?.phaseFinalTestProgress,
    ).passedPhaseIndices,
    studyingPlanProgress: {
      distinctPassedVideos: extras.distinctPassedVideos,
      vocabularyTermsTotal: extras.vocabularyTermsTotal,
    },
    favoriteGenres: extra?.favoriteGenres?.map((genre) => genre.id) ?? [],
    hatedGenres: extra?.hatedGenres?.map((genre) => genre.id) ?? [],
    playbackSpeed: user.settings?.playbackSpeed ?? null,
    videoQuality: user.settings?.currentResolution ?? "",
    subscriptionPlan: user.subscriptionPlan ?? "",
    subscriptionStatus: user.subscriptionStatus ?? "",
    stripeSubscriptionId: user.stripeSubscriptionId ?? "",
    teacherId: user.teacherId ?? null,
    teacherName: user.teacher?.name ?? null,
    className: user.class?.name ?? null,
  };
}
