import { StyleSheet, Text, View } from "react-native";
import type { MainTabScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";

type Props = MainTabScreenProps<"Profile">;

export function ProfileScreen({ navigation }: Props) {
  const { user, logout, isLoading } = useUser();

  const handleSignOut = async () => {
    await logout();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

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
        <Text style={styles.title}>Profile</Text>
        <AppButton
          label="Sign in"
          onPress={() => {
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{user.name || "Learner"}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.statsRow}>
        <StatBlock label="Level" value={String(user.level)} />
        <StatBlock label="XP" value={String(user.xp)} />
        <StatBlock label="Streak" value={String(user.currentStreak)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>English level</Text>
        <Text style={styles.sectionValue}>{user.englishLevel || "—"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Subscription</Text>
        <Text style={styles.sectionValue}>
          {user.subscriptionStatus?.trim() || "none"}
          {user.subscriptionPlan ? ` · ${user.subscriptionPlan}` : ""}
        </Text>
      </View>

      <AppButton label="Sign out" variant="ghost" onPress={() => void handleSignOut()} />
    </ScreenContainer>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  email: {
    color: colors.textMuted,
    marginBottom: 24,
  },
  muted: {
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionValue: {
    color: colors.text,
    fontSize: 16,
  },
});
