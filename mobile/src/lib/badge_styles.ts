/**
 * Badge color helpers ported from frontend CatalogVideoCard.
 */
import { colors } from "../theme/colors";

const levelPattern = /^(A1|A2|B1|B2|C1|C2)$/i;

type BadgeColors = {
  backgroundColor: string;
  color: string;
};

export function resolve_level_badge_colors(label: string): BadgeColors {
  const normalized = label.trim().toUpperCase();
  if (levelPattern.test(normalized)) {
    const map: Record<string, BadgeColors> = {
      A1: { backgroundColor: colors.accent, color: colors.accentForeground },
      A2: { backgroundColor: colors.accent, color: colors.accentForeground },
      B1: { backgroundColor: "rgba(129, 61, 236, 0.8)", color: colors.primaryForeground },
      B2: { backgroundColor: colors.primary, color: colors.primaryForeground },
      C1: { backgroundColor: "rgba(171, 16, 65, 0.8)", color: colors.text },
      C2: { backgroundColor: colors.destructive, color: colors.text },
    };
    return map[normalized] ?? { backgroundColor: colors.muted, color: colors.textMuted };
  }
  return { backgroundColor: "rgba(45, 161, 125, 0.2)", color: colors.accent };
}

export function resolve_age_badge_colors(age: string): BadgeColors {
  const map: Record<string, BadgeColors> = {
    "0+": { backgroundColor: colors.accent, color: colors.text },
    "6+": { backgroundColor: colors.lightBlue, color: colors.text },
    "12+": { backgroundColor: colors.yellow, color: colors.text },
    "16+": { backgroundColor: colors.orange, color: colors.text },
    "18+": { backgroundColor: colors.destructive, color: colors.text },
    "21+": { backgroundColor: colors.primary, color: colors.text },
  };
  return map[age] ?? { backgroundColor: colors.muted, color: colors.textMuted };
}

export function extract_cefr_level(systemTags: readonly string[] | undefined): string | null {
  if (!systemTags) {
    return null;
  }
  const match = systemTags.find((tag) => levelPattern.test(tag.trim()));
  return match?.trim().toUpperCase() ?? null;
}
