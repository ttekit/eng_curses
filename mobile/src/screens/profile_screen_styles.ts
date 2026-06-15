import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export const profileScreenStyles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.tabBarContentInset,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    fontSize: 20,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
    marginBottom: 12,
  },
  muted: {
    color: colors.textMuted,
  },
  links: {
    gap: 8,
    marginTop: 4,
  },
  linkRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  sectionValue: {
    ...typography.body,
    color: colors.text,
  },
  statBlock: {
    flex: 1,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 20,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
