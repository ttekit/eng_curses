import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { MainTabScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { ScreenHeader } from "../components/ScreenHeader";
import { CatalogVideoRow } from "../components/catalog/CatalogVideoRow";
import { RecapActionCard } from "../components/RecapActionCard";
import type { CatalogCardVideo } from "../components/CatalogVideoCard";
import { fetch_learner_recap_status } from "../lib/learner_recap";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

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
  const [recapStatus, setRecapStatus] = useState<Awaited<
    ReturnType<typeof fetch_learner_recap_status>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [watchedResponse, recap] = await Promise.all([
      apiFetch("/content-video/watched", { method: "GET" }),
      fetch_learner_recap_status(),
    ]);
    if (!watchedResponse.ok) {
      throw new Error(await readApiErrorBody(watchedResponse));
    }
    const data = (await watchedResponse.json()) as WatchedItem[];
    setItems(Array.isArray(data) ? data : []);
    setRecapStatus(recap);
  }, []);

  useEffect(() => {
    void load()
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [load]);

  const cards: CatalogCardVideo[] = items.map((item) => ({
    id: item.contentVideoId,
    title: item.videoName,
    categoryLabel: item.categoryName ?? "Lesson",
    thumbnailUrl: item.thumbnailUrl,
    contentId: item.contentId,
  }));

  const openVideo = (card: CatalogCardVideo) => {
    navigation.getParent()?.navigate("Content", {
      contentId: card.contentId ?? items.find((i) => i.contentVideoId === card.id)?.contentId ?? 0,
      videoId: card.id,
    });
  };

  return (
    <ScreenContainer padded={false}>
      {loading ? (
        <LoadingCenter />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load().finally(() => setRefreshing(false));
              }}
            />
          }
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <ScreenHeader
              title="My lessons"
              subtitle="Completed lessons and practice recaps"
            />
          </View>
          <View style={styles.recapSection}>
            <RecapActionCard
              title="Mistakes practice"
              body="Review questions you missed recently."
              status={recapStatus?.mistakes}
              onPress={() => navigation.getParent()?.navigate("LearnerRecap", { kind: "mistakes" })}
            />
            <RecapActionCard
              title="Weekly recap"
              body="Summarize what you learned this week."
              status={recapStatus?.weekly}
              onPress={() => navigation.getParent()?.navigate("LearnerRecap", { kind: "weekly" })}
            />
            <RecapActionCard
              title="Monthly recap"
              body="A broader review of your monthly progress."
              status={recapStatus?.monthly}
              onPress={() => navigation.getParent()?.navigate("LearnerRecap", { kind: "monthly" })}
            />
          </View>
          {cards.length === 0 ? (
            <Text style={styles.empty}>
              Watch at least 75% of a catalog video to see it here.
            </Text>
          ) : (
            <CatalogVideoRow
              title="Watched lessons"
              videos={cards}
              onPressVideo={openVideo}
              isAdultUser
            />
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
  },
  recapSection: {
    paddingHorizontal: spacing.screenPadding,
    gap: 12,
    marginBottom: spacing.sectionGap,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing.screenPadding,
    marginTop: 20,
  },
});
