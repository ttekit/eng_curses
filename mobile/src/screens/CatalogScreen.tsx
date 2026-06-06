import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useUser } from "../context/UserContext";
import { learnerNeedsPlacement, resolvePlacementPhase } from "../lib/learnerOnboarding";
import { userMayUseLearnerApp } from "../lib/subscriptionAccess";
import { colors } from "../theme/colors";

type ContentVideo = {
  id: number;
  videoName: string;
  thumbnailUrl?: string;
  videoLink: string;
  content: {
    id: number;
    category: {
      name: string;
    };
  };
};

type Props = MainTabScreenProps<"Catalog">;

function toCardVideo(video: ContentVideo): CatalogCardVideo {
  return {
    id: video.id,
    title: video.videoName,
    categoryLabel: video.content.category.name,
    thumbnailUrl: video.thumbnailUrl,
    videoLink: video.videoLink,
  };
}

export function CatalogScreen({ navigation }: Props) {
  const { user } = useUser();
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const placementPhase = useMemo(
    () => (user ? resolvePlacementPhase(user) : "off"),
    [user],
  );

  const loadVideos = useCallback(async () => {
    const response = await apiFetch("/content-video", { method: "GET" });
    if (!response.ok) {
      throw new Error(await readApiErrorBody(response));
    }
    const data = (await response.json()) as ContentVideo[];
    setVideos(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    if (user && !userMayUseLearnerApp(user)) {
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: "Subscribe" }],
      });
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        await loadVideos();
      } catch (err) {
        Alert.alert(
          "Catalog",
          err instanceof Error ? err.message : "Could not load videos.",
        );
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [user, loadVideos, navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadVideos();
    } catch {
      Alert.alert("Catalog", "Could not refresh the catalog.");
    } finally {
      setRefreshing(false);
    }
  };

  const cards = useMemo(() => videos.map(toCardVideo), [videos]);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </Text>
        <Text style={styles.subtitle}>Pick a lesson to watch</Text>
      </View>

      {placementPhase !== "off" ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Complete your level test</Text>
          <Text style={styles.bannerBody}>
            {placementPhase === "preferences"
              ? "Finish your learning preferences on the web app, then return here."
              : "Open the placement test in your browser to unlock personalized recommendations."}
          </Text>
        </View>
      ) : null}

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
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No videos in the catalog yet.</Text>
          }
          renderItem={({ item }) => (
            <CatalogVideoCard
              video={item}
              onPress={() => {
                const source = videos.find((video) => video.id === item.id);
                if (!source) return;
                if (user && learnerNeedsPlacement(user)) {
                  Alert.alert(
                    "Placement test",
                    "Complete your placement test before watching lessons.",
                  );
                  return;
                }
                navigation.getParent()?.navigate("Content", {
                  contentId: source.content.id,
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  greeting: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 15,
  },
  banner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  bannerBody: {
    color: colors.textMuted,
    lineHeight: 20,
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
  },
});
