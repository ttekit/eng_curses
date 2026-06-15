import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { ScreenHeader } from "../components/ScreenHeader";
import { AppButton } from "../components/AppButton";
import { useUser } from "../context/UserContext";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export function LearningPlanScreen() {
  const { user, refreshProfile } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle_regenerate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await apiFetch("/auth/profile/regenerate-studying-plan", {
        method: "POST",
      });
      if (!response.ok) {
        setMessage(await readApiErrorBody(response));
        return;
      }
      await refreshProfile();
      setMessage("Your studying plan was refreshed.");
    } catch {
      setMessage("Could not regenerate plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Learning plan"
          subtitle="Your personalized roadmap based on level, goals, and progress."
        />
        <View style={styles.card}>
          <Text style={styles.label}>English level</Text>
          <Text style={styles.value}>{user?.englishLevel || "Not set"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Goal</Text>
          <Text style={styles.value}>{user?.learningGoal || "Improve English"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Target horizon</Text>
          <Text style={styles.value}>{user?.timeToAchieve || "Flexible"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Placement</Text>
          <Text style={styles.value}>
            {user?.hasCompletedPlacement ? "Completed" : "Pending — finish on web or catalog"}
          </Text>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <AppButton
          label="Regenerate plan"
          loading={loading}
          onPress={() => void handle_regenerate()}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.itemGap,
    paddingBottom: 32,
  },
  card: {
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    gap: 4,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  value: {
    ...typography.body,
    color: colors.text,
  },
  message: {
    ...typography.caption,
    color: colors.accent,
    textAlign: "center",
  },
});
