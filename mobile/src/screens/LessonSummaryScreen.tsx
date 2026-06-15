import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { ContentWatchHeader } from "../components/ContentWatchHeader";
import { AppButton } from "../components/AppButton";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type LessonPayload = {
  videoName: string;
  videoDescription?: string | null;
  content: { category: { name: string } };
};

type Props = RootStackScreenProps<"LessonSummary">;

export function LessonSummaryScreen({ navigation, route }: Props) {
  const { user } = useUser();
  const { videoId, xpEarned } = route.params;
  const [lesson, setLesson] = useState<LessonPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiFetch(`/content-video/${videoId}`, { method: "GET" });
        if (!response.ok) {
          throw new Error(await readApiErrorBody(response));
        }
        setLesson((await response.json()) as LessonPayload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load summary.");
      }
    };
    void load();
  }, [videoId]);

  return (
    <ScreenContainer padded={false}>
      <ContentWatchHeader
        onBack={() => navigation.goBack()}
        rightLabel={user ? `${user.xp} XP` : undefined}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>Lesson complete</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {lesson ? (
          <>
            <Text style={styles.title}>{lesson.videoName}</Text>
            <Text style={styles.category}>{lesson.content.category.name}</Text>
            {lesson.videoDescription ? (
              <Text style={styles.body}>{lesson.videoDescription}</Text>
            ) : null}
          </>
        ) : null}
        <View style={styles.stats}>
          <Stat label="XP earned" value={String(xpEarned ?? 0)} />
          <Stat label="Total XP" value={String(user?.xp ?? 0)} />
          <Stat label="Streak" value={String(user?.currentStreak ?? 0)} />
        </View>
        <AppButton
          label="Back to catalog"
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })
          }
        />
        <AppButton
          label="My lessons"
          variant="secondary"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenPadding,
    gap: spacing.itemGap,
    paddingBottom: 32,
  },
  badge: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primary,
    textTransform: "uppercase",
  },
  title: {
    ...typography.displayTitle,
    color: colors.text,
    fontSize: 26,
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 20,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
