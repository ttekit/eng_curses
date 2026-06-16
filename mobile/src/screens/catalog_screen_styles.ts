import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export const catalogScreenStyles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.tabBarContentInset,
  },
  heroSpacer: {
    marginTop: 8,
    marginBottom: 20,
  },
  banner: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sectionGap,
    padding: 14,
    borderRadius: spacing.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginBottom: 4,
  },
  bannerBody: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: spacing.screenPadding,
  },
});
