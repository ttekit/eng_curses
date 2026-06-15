import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamilies, typography } from "../theme/typography";

export const loginScreenStyles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 10,
  },
  welcome: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    marginTop: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  form: {
    gap: spacing.itemGap,
  },
  footerLink: {
    ...typography.caption,
    color: colors.primary,
    textAlign: "center",
  },
});
