import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MainTabScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import {
  CatalogVideoCard,
  type CatalogCardVideo,
} from "../components/CatalogVideoCard";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { colors } from "../theme/colors";

type WatchedItem = {
  contentVideoId: number;
  contentId: number;
  videoName: string;
  thumbnailUrl?: string;
  categoryName?: string;
};

type Props = MainTabScreenProps<"MyLessons">;

export function MyLessonsScreen({ navigation }: Props) {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const response = await apiFetch("/content-video/watched", { method: "GET" });
    if (!response.ok) {
      throw new Error(await readApiErrorBody(response));
    }
    const data = (await response.json()) as WatchedItem[];
    setItems(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await load();
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [load]);

  const cards: CatalogCardVideo[] = items.map((item) => ({
    id: item.contentVideoId,
    title: item.videoName,
    categoryLabel: item.categoryName ?? "Lesson",
    thumbnailUrl: item.thumbnailUrl,
  }));

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My lessons</Text>
        <Text style={styles.subtitle}>Lessons you have completed</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load().finally(() => setRefreshing(false));
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Watch at least 75% of a catalog video to see it here.
            </Text>
          }
          renderItem={({ item, index }) => {
            const source = items[index];
            return (
              <CatalogVideoCard
                video={item}
                onPress={() => {
                  if (!source) return;
                  navigation.getParent()?.navigate("Content", {
                    contentId: source.contentId,
                    videoId: source.contentVideoId,
                  });
                }}
              />
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
});
