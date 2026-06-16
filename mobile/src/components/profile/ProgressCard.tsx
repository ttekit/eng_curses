import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type ProgressCardProps = {
  title: string;
  percent: number;
  caption: string;
};

export function ProgressCard({ title, percent, caption }: ProgressCardProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.percent}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
      <Text style={styles.caption}>{caption}</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  percent: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primary,
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});
