import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export type AchievementItem = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  unlocked: boolean;
};

type AchievementGridProps = {
  items: readonly AchievementItem[];
};

export function AchievementGrid({ items }: AchievementGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.cell, item.unlocked ? styles.cellUnlocked : styles.cellLocked]}
        >
          <View
            style={[
              styles.iconCircle,
              item.unlocked ? styles.iconUnlocked : styles.iconLocked,
            ]}
          >
            <Feather
              name={item.unlocked ? item.icon : "lock"}
              size={16}
              color={item.unlocked ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cell: {
    width: "30%",
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  cellUnlocked: {
    backgroundColor: `${colors.primary}1A`,
    borderColor: `${colors.primary}4D`,
  },
  cellLocked: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconUnlocked: {
    backgroundColor: `${colors.primary}33`,
  },
  iconLocked: {
    backgroundColor: colors.card,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontSize: 10,
    textAlign: "center",
  },
});
