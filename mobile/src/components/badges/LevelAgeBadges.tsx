import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { resolve_age_badge_colors, resolve_level_badge_colors } from "../../lib/badge_styles";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type LevelBadgeProps = {
  label: string;
  style?: ViewStyle;
};

export function LevelBadge({ label, style }: LevelBadgeProps) {
  const palette = resolve_level_badge_colors(label);
  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }, style]}>
      <Text style={[styles.text, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

type AgeBadgeProps = {
  age: string;
  style?: ViewStyle;
};

export function AgeBadge({ age, style }: AgeBadgeProps) {
  const palette = resolve_age_badge_colors(age);
  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }, style]}>
      <Text style={[styles.text, { color: palette.color }]}>{age}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    fontSize: 11,
  },
});
