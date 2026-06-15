import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import type { CatalogHeroVideo } from "../../lib/catalog_layout";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { fontFamilies, typography } from "../../theme/typography";

type CatalogHeroProps = {
  featured: CatalogHeroVideo | null;
  levelLabel?: string | null;
  onStartWatching: () => void;
};

export function CatalogHero({
  featured,
  levelLabel,
  onStartWatching,
}: CatalogHeroProps) {
  const badgeLabel = levelLabel
    ? `Featured · ${levelLabel}`
    : "Featured";
  const meta = featured?.categoryName
    ? `${featured.categoryName} · Listening & Vocabulary`
    : "Curated lesson · Listening & Vocabulary";

  const overlay = (
    <>
      <LinearGradient
        colors={["transparent", "rgba(9,9,11,0.2)", "rgba(9,9,11,0.9)"]}
        style={styles.scrim}
      />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
        <Text style={styles.title}>
          {featured?.title ?? "Discover your next lesson"}
        </Text>
        <Text style={styles.meta} numberOfLines={2}>
          {featured?.description ? `${meta.split("·")[0]?.trim()} · ` : ""}
          {featured?.description ?? "Browse curated video lessons by level."}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onStartWatching}
          disabled={!featured}
          style={({ pressed }) => [
            styles.playPill,
            !featured ? styles.playPillDisabled : null,
            pressed ? styles.playPillPressed : null,
          ]}
        >
          <Feather name="play" size={14} color={colors.background} />
          <Text style={styles.playText}>Play now</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onStartWatching}
      disabled={!featured}
      style={styles.wrap}
    >
      {featured?.thumbnailUrl ? (
        <ImageBackground source={{ uri: featured.thumbnailUrl }} style={styles.frame}>
          {overlay}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={[colors.primary, `${colors.primary}B3`, `${colors.accent}99`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frame}
        >
          {overlay}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.screenPadding,
    borderRadius: spacing.cardRadius + 4,
    overflow: "hidden",
  },
  frame: {
    aspectRatio: 16 / 9,
    width: "100%",
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    padding: 16,
    gap: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primaryForeground,
    fontSize: 11,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  playPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.text,
    borderRadius: spacing.pillRadius,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  playPillDisabled: {
    opacity: 0.5,
  },
  playPillPressed: {
    opacity: 0.88,
  },
  playText: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.background,
    fontSize: 12,
  },
});
