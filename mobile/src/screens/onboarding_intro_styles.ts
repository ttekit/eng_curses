import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export const onboardingIntroStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 24,
  },
  skip: {
    alignSelf: "flex-end",
    paddingTop: 8,
    paddingBottom: 12,
  },
  skipText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 8,
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${colors.primary}26`,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepText: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    ...typography.displayTitle,
    color: colors.text,
    fontSize: 24,
    textAlign: "center",
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
  },
  actions: {
    gap: 12,
  },
});
