import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { RecapKind } from "../lib/learner_recap";
import type { LegalSlug } from "../lib/legal_content";
import type { GeneratedStudentAccount } from "../lib/register_user";

export type RootStackParamList = {
  Login: undefined;
  RegisterName: undefined;
  RegisterEmail: undefined;
  RegisterPassword: undefined;
  RegisterDob: undefined;
  RegisterDetails: undefined;
  RegisterPreferences: undefined;
  RegisterSuccess: {
    generatedStudents?: GeneratedStudentAccount[];
  } | undefined;
  VerifyEmail: { email: string };
  RestoreAccount: { email?: string } | undefined;
  Pricing: undefined;
  LegalDocument: { slug: LegalSlug };
  Subscribe: undefined;
  OnboardingDob: undefined;
  OnboardingIntro: undefined;
  MainTabs: undefined;
  Content: { contentId: number; videoId?: number };
  LessonSummary: { videoId: number; xpEarned?: number };
  CatalogSeries: { friendlyLink: string; contentId: number };
  LearnerRecap: { kind: RecapKind };
  LevelTest: undefined;
  NotFound: undefined;
};

export type MainTabParamList = {
  Catalog: undefined;
  Search: undefined;
  MyLessons: undefined;
  Classroom: undefined;
  LearningPlan: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type AppRouteName = keyof RootStackParamList;
