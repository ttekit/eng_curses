import { StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export const searchScreenStyles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.tabBarContentInset,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    fontSize: 20,
    marginBottom: 12,
    marginTop: 12,
  },
  searchWrap: {
    position: "relative",
    marginBottom: 8,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 1,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 14,
    zIndex: 1,
    padding: 2,
  },
  chips: {
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.muted,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.primaryForeground,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  trendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  trendingTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  trendingWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  trendingChip: {
    backgroundColor: colors.muted,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trendingText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 12,
  },
  resultCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "47%",
  },
  gridCategory: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 40,
  },
  input: {
    minHeight: 44,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 16,
    fontFamily: typography.body.fontFamily,
  },
});
