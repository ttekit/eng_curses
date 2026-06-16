import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RecapStatusItem } from "../lib/learner_recap";
import { format_recap_cooldown } from "../lib/learner_recap";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { AppButton } from "./AppButton";

type RecapActionCardProps = {
  title: string;
  body: string;
  status: RecapStatusItem | undefined;
  onPress: () => void;
};

export function RecapActionCard({
  title,
  body,
  status,
  onPress,
}: RecapActionCardProps) {
  const available = status?.available === true;
  const cooldown = format_recap_cooldown(status?.nextAvailableAt ?? null);
  const ctaLabel = available
    ? "Start recap"
    : status?.completedInPeriod
      ? "Completed"
      : cooldown
        ? `Available in ${cooldown}`
        : (status?.reason ?? "Unavailable");

  return (
    <View style={[styles.card, available ? styles.cardActive : null]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {typeof status?.lastScorePct === "number" && status.completedInPeriod ? (
        <Text style={styles.score}>Last score: {Math.round(status.lastScorePct)}%</Text>
      ) : null}
      <AppButton
        label={ctaLabel}
        onPress={onPress}
        disabled={!available}
        variant={available ? "primary" : "secondary"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    gap: 8,
  },
  cardActive: {
    borderColor: colors.primary,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 17,
  },
  body: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  score: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.text,
  },
});
