import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChameleonMascot } from "../ChameleonMascot";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamilies, typography } from "../../theme/typography";

type IdentityCardProps = {
  name: string;
  subtitle: string;
  levelLabel: string;
};

export function IdentityCard({ name, subtitle, levelLabel }: IdentityCardProps) {
  return (
    <LinearGradient
      colors={[`${colors.primary}33`, `${colors.accent}1A`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <ChameleonMascot size="md" mood="happy" />
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>{levelLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.cardRadius + 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fontFamilies.display,
    fontSize: 18,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  levelPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primaryForeground,
    fontSize: 11,
  },
});
