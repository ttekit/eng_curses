import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BrandLogo } from "./BrandLogo";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ContentWatchHeaderProps = {
  onBack: () => void;
  rightLabel?: string;
};

export function ContentWatchHeader({ onBack, rightLabel }: ContentWatchHeaderProps) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to catalog"
        onPress={onBack}
        style={styles.back}
      >
        <Feather name="arrow-left" size={20} color={colors.textMuted} />
        <Text style={styles.backLabel} numberOfLines={1}>
          Back
        </Text>
      </Pressable>
      <View style={styles.center} pointerEvents="none">
        <BrandLogo compact />
      </View>
      <View style={styles.right}>
        {rightLabel?.trim() ? (
          <Text style={styles.rightLabel} numberOfLines={1}>
            {rightLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: spacing.screenPaddingCompact,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.headerBar,
  },
  back: {
    position: "absolute",
    left: spacing.screenPaddingCompact,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 96,
  },
  backLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 14,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    position: "absolute",
    right: spacing.screenPaddingCompact,
    zIndex: 2,
    maxWidth: 96,
    alignItems: "flex-end",
  },
  rightLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
});
