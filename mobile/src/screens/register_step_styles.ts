import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export const registerStepStyles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    fontSize: 22,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  form: {
    gap: spacing.itemGap,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    ...typography.caption,
    color: colors.primary,
  },
  footerLink: {
    ...typography.caption,
    color: colors.primary,
    textAlign: "center",
  },
});
