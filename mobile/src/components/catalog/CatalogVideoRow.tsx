import { FlatList, StyleSheet, Text, View } from "react-native";
import { CatalogVideoCard, type CatalogCardVideo } from "../CatalogVideoCard";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type CatalogVideoRowProps = {
  title: string;
  description?: string;
  videos: CatalogCardVideo[];
  onPressVideo: (video: CatalogCardVideo) => void;
  isAdultUser: boolean;
};

export function CatalogVideoRow({
  title,
  description,
  videos,
  onPressVideo,
  isAdultUser,
}: CatalogVideoRowProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <FlatList
        horizontal
        nestedScrollEnabled
        data={videos}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CatalogVideoCard
            video={item}
            isAdultUser={isAdultUser}
            onPress={() => onPressVideo(item)}
            style={styles.cardSpacing}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sectionGap,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: 12,
    gap: 4,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
  },
  list: {
    height: spacing.catalogRowCompactHeight,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
  },
  cardSpacing: {
    marginRight: 12,
  },
});
