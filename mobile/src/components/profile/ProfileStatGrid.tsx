import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type StatItem = {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
};

type ProfileStatGridProps = {
  items: readonly StatItem[];
};

export function ProfileStatGrid({ items }: ProfileStatGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.cell}>
          <Feather name={item.icon} size={20} color={item.color} />
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    gap: 4,
  },
  value: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 18,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
});
