import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ChameleonMascot } from "../ChameleonMascot";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type CatalogHomeHeaderProps = {
  userName: string;
  streak: number;
};

export function CatalogHomeHeader({ userName, streak }: CatalogHomeHeaderProps) {
  const firstName = userName.trim().split(" ")[0] || "Learner";
  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <ChameleonMascot size="sm" mood="happy" />
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.streakPill}>
          <Feather name="zap" size={14} color={colors.chart3} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
        <Pressable accessibilityLabel="Notifications" style={styles.bellWrap}>
          <Feather name="bell" size={20} color={colors.textMuted} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 12,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcome: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 14,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.chart3}26`,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.chart3,
    fontSize: 12,
  },
  bellWrap: {
    position: "relative",
    padding: 2,
  },
  bellDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
