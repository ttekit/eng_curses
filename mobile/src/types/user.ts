/**
 * Learner profile shape returned by `GET /auth/profile`.
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  role: string;
  isTwoFactorEnable: boolean;
  hasCompletedPlacement: boolean;
  englishLevel: string;
  hobbies: string[];
  education: string;
  workField: string;
  nativeLanguage: string;
  favoriteGenres: number[];
  hatedGenres: number[];
  avatarUrl?: string;
  playbackSpeed?: number | null;
  videoQuality?: string;
  learningGoal?: string;
  timeToAchieve?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  stripeSubscriptionId?: string;
  teacherId?: number | null;
  teacherName?: string | null;
  currentStreak: number;
  xp: number;
  level: number;
  achievements: string[];
}
