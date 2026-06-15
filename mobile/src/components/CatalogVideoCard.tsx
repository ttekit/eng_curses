import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { AgeBadge } from "./badges/LevelAgeBadges";
import { pick_chart_gradient } from "../theme/chart_gradients";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export type CatalogCardVideo = {
  id: number;
  title: string;
  categoryLabel: string;
  thumbnailUrl?: string;
  videoLink?: string;
  ageRestriction?: string;
  level?: string;
  contentId?: number;
};

type CatalogVideoCardProps = {
  video: CatalogCardVideo;
  onPress: () => void;
  isAdultUser?: boolean;
  style?: ViewStyle;
  variant?: "default" | "compact";
  gradientSeed?: number;
};

export function CatalogVideoCard({
  video,
  onPress,
  isAdultUser = false,
  style,
  variant = "compact",
  gradientSeed = video.id,
}: CatalogVideoCardProps) {
  const source: ImageSourcePropType | undefined = video.thumbnailUrl
    ? { uri: video.thumbnailUrl }
    : undefined;
  const age = video.ageRestriction ?? "0+";
  const isLocked = (age === "18+" || age === "21+") && !isAdultUser;
  const cardWidth =
    variant === "compact" ? spacing.catalogCardCompactWidth : spacing.catalogCardWidth;
  const gradient = pick_chart_gradient(gradientSeed);
  const levelLabel = video.level ?? video.categoryLabel;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth },
        style,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.thumbWrap}>
        {source ? (
          <Image
            source={source}
            style={[styles.thumb, isLocked ? styles.thumbLocked : null]}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={[gradient[0], gradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.thumb}
          />
        )}
        <View style={styles.levelPill}>
          <Text style={styles.levelText}>{levelLabel}</Text>
        </View>
        {video.ageRestriction && variant === "default" ? (
          <View style={styles.badgeBottom}>
            <AgeBadge age={video.ageRestriction} />
          </View>
        ) : null}
        {!isLocked ? (
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}>
              <Feather name="play" size={variant === "compact" ? 14 : 18} color={colors.text} />
            </View>
          </View>
        ) : (
          <View style={styles.lockOverlay}>
            <Feather name="lock" size={20} color={colors.text} />
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {video.title}
      </Text>
      {variant === "default" ? (
        <Text style={styles.category} numberOfLines={1}>
          {video.categoryLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  pressed: {
    opacity: 0.88,
  },
  thumbWrap: {
    borderRadius: spacing.cardRadius,
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: colors.surfaceElevated,
  },
  thumb: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceElevated,
  },
  thumbLocked: {
    opacity: 0.45,
  },
  levelPill: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: `${colors.background}CC`,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 10,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.text,
  },
  badgeBottom: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.background}D9`,
    alignItems: "center",
    justifyContent: "center",
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9, 9, 11, 0.35)",
  },
  title: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.text,
    fontSize: 12,
  },
  category: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
