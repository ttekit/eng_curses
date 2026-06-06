import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import { colors } from "../theme/colors";

export type CatalogCardVideo = {
  id: number;
  title: string;
  categoryLabel: string;
  thumbnailUrl?: string;
  videoLink?: string;
};

type CatalogVideoCardProps = {
  video: CatalogCardVideo;
  onPress: () => void;
};

export function CatalogVideoCard({ video, onPress }: CatalogVideoCardProps) {
  const source: ImageSourcePropType | undefined = video.thumbnailUrl
    ? { uri: video.thumbnailUrl }
    : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.thumbWrap}>
        {source ? (
          <Image source={source} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Text style={styles.thumbFallbackText}>Explys</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {video.title}
      </Text>
      <Text style={styles.category} numberOfLines={1}>
        {video.categoryLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  thumbWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  thumb: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceElevated,
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  thumbFallbackText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 18,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  category: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
