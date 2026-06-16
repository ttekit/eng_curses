import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { MainTabScreenProps } from "../navigation/types";
import type { LegalSlug } from "../lib/legal_content";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { AchievementGrid } from "../components/profile/AchievementGrid";
import { IdentityCard } from "../components/profile/IdentityCard";
import { LinkRow } from "../components/profile/LinkRow";
import { ProfileStatGrid } from "../components/profile/ProfileStatGrid";
import { ProgressCard } from "../components/profile/ProgressCard";
import { SkillBars } from "../components/profile/SkillBars";
import { useUser } from "../context/UserContext";
import { apiFetch } from "../lib/api";
import {
  build_achievement_items,
  build_skill_scores,
  format_hours,
} from "../lib/profile_derived";
import { colors } from "../theme/colors";
import { profileScreenStyles as styles } from "./profile_screen_styles";

type LearningStats = {
  totalWatchTimeMin: number;
  videosCompleted: number;
  testsCompleted: number;
  averageScore: number | null;
};

type Props = MainTabScreenProps<"Profile">;

const LEGAL_LINKS: Array<{ slug: LegalSlug; label: string }> = [
  { slug: "about", label: "About" },
  { slug: "privacy", label: "Privacy" },
  { slug: "terms", label: "Terms" },
  { slug: "feedback", label: "Feedback" },
];

export function ProfileScreen({ navigation }: Props) {
  const { user, logout, isLoading } = useUser();
  const [stats, setStats] = useState<LearningStats | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await apiFetch("/profile/learning-stats", { method: "GET" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as Record<string, unknown>;
      setStats({
        totalWatchTimeMin: Number(data.totalWatchTimeMin ?? 0),
        videosCompleted: Number(data.videosCompleted ?? 0),
        testsCompleted: Number(data.testsCompleted ?? 0),
        averageScore:
          data.averageScore === null || data.averageScore === undefined
            ? null
            : Number(data.averageScore),
      });
    };
    if (user) {
      void load();
    }
  }, [user]);

  const skills = useMemo(
    () => build_skill_scores(stats?.averageScore ?? null),
    [stats?.averageScore],
  );
  const achievements = useMemo(
    () =>
      build_achievement_items(user?.achievements ?? [], stats, user?.currentStreak ?? 0),
    [stats, user?.achievements, user?.currentStreak],
  );
  const progressPercent = useMemo(() => {
    const xp = user?.xp ?? 0;
    return Math.min(100, Math.round((xp % 1000) / 10));
  }, [user?.xp]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <Text style={styles.muted}>Loading profile…</Text>
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer>
        <AppButton
          label="Sign in"
          onPress={() => navigation.getParent()?.navigate("Login")}
        />
      </ScreenContainer>
    );
  }

  const levelLabel = user.englishLevel
    ? `Level ${user.englishLevel}`
    : `Level ${user.level}`;

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Pressable accessibilityLabel="Settings">
            <Feather name="settings" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
        <IdentityCard
          name={user.name || "Learner"}
          subtitle={`${user.role || "Learner"} · ${user.email}`}
          levelLabel={levelLabel}
        />
        <ProfileStatGrid
          items={[
            { label: "Day streak", value: String(user.currentStreak), icon: "zap", color: colors.chart3 },
            { label: "Hours", value: format_hours(stats?.totalWatchTimeMin ?? 0), icon: "clock", color: colors.chart2 },
            { label: "Videos", value: String(stats?.videosCompleted ?? 0), icon: "award", color: colors.primary },
          ]}
        />
        <ProgressCard
          title="Progress to next level"
          percent={progressPercent}
          caption={`${user.xp} XP earned · keep watching to level up`}
        />
        <View>
          <Text style={styles.sectionTitle}>Skill breakdown</Text>
          <SkillBars skills={skills} />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <AchievementGrid items={achievements} />
        </View>
        <AppButton
          label="Re-take level test"
          variant="secondary"
          onPress={() => navigation.getParent()?.navigate("LevelTest")}
        />
        <View style={styles.links}>
          <LinkRow label="Classroom" onPress={() => navigation.navigate("Classroom")} />
          <LinkRow label="Learning plan" onPress={() => navigation.navigate("LearningPlan")} />
          <LinkRow label="Pricing" onPress={() => navigation.getParent()?.navigate("Pricing")} />
          {LEGAL_LINKS.map((link) => (
            <LinkRow
              key={link.slug}
              label={link.label}
              onPress={() =>
                navigation.getParent()?.navigate("LegalDocument", { slug: link.slug })
              }
            />
          ))}
        </View>
        <AppButton
          label="Sign out"
          variant="ghost"
          onPress={() => {
            void logout().then(() => {
              navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
            });
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
