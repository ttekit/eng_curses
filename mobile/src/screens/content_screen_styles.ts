import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export const contentScreenStyles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.screenPadding,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  content: {
    paddingBottom: 32,
  },
  playerFrame: {
    marginHorizontal: spacing.screenPaddingCompact,
    marginTop: 12,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  lockPanel: {
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
    backgroundColor: colors.card,
  },
  lockTitle: {
    ...typography.sectionTitle,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
  },
  lockBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  meta: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
    gap: 10,
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(129, 61, 236, 0.2)",
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  category: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primary,
    textTransform: "uppercase",
  },
  title: {
    ...typography.displayTitle,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
