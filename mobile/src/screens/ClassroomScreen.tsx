import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MainTabScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { ScreenHeader } from "../components/ScreenHeader";
import { CatalogVideoCard, type CatalogCardVideo } from "../components/CatalogVideoCard";
import { apiFetch } from "../lib/api";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type ClassroomVideo = {
  id: number;
  title: string;
  categoryLabel: string;
  thumbnailUrl?: string;
  contentId: number;
};

type Props = MainTabScreenProps<"Classroom">;

export function ClassroomScreen({ navigation }: Props) {
  const { user } = useUser();
  const [videos, setVideos] = useState<ClassroomVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isTeacher = user?.role === "teacher";

  const load = useCallback(async () => {
    const endpoint = isTeacher
      ? "/contents/teacher/my-series"
      : "/contents/student/teacher-videos";
    const response = await apiFetch(endpoint, { method: "GET" });
    if (!response.ok) {
      setVideos([]);
      return;
    }
    const data = (await response.json()) as Array<Record<string, unknown>>;
    const parsed: ClassroomVideo[] = [];
    for (const row of data) {
      const id = Number(row.contentVideoId ?? row.contentId);
      if (!Number.isFinite(id)) {
        continue;
      }
      parsed.push({
        id,
        contentId: Number(row.contentId ?? id),
        title: String(row.name ?? row.videoName ?? "Lesson"),
        categoryLabel: isTeacher ? "My series" : "Teacher assignment",
        thumbnailUrl:
          typeof row.thumbnailUrl === "string" ? row.thumbnailUrl : undefined,
      });
    }
    setVideos(parsed);
  }, [isTeacher]);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const cards: CatalogCardVideo[] = videos.map((video) => ({
    id: video.id,
    title: video.title,
    categoryLabel: video.categoryLabel,
    thumbnailUrl: video.thumbnailUrl,
    contentId: video.contentId,
  }));

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Classroom"
          subtitle={
            isTeacher
              ? "Series you publish for students"
              : "Videos assigned by your teacher"
          }
        />
      </View>
      {loading ? (
        <LoadingCenter />
      ) : (
        <FlatList
          horizontal
          nestedScrollEnabled
          data={cards}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
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
            <Text style={styles.empty}>No classroom videos yet.</Text>
          }
          renderItem={({ item, index }) => (
            <CatalogVideoCard
              video={item}
              style={styles.cardSpacing}
              onPress={() => {
                const source = videos[index];
                if (!source) {
                  return;
                }
                navigation.getParent()?.navigate("Content", {
                  contentId: source.contentId,
                  videoId: source.id,
                });
              }}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
  },
  list: {
    height: spacing.catalogRowHeight,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
  },
  cardSpacing: {
    marginRight: 12,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    paddingHorizontal: spacing.screenPadding,
  },
});
