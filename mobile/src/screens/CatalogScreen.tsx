import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { MainTabScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { CatalogHomeHeader } from "../components/catalog/CatalogHomeHeader";
import { CatalogHero } from "../components/catalog/CatalogHero";
import { CatalogVideoRow } from "../components/catalog/CatalogVideoRow";
import type { CatalogCardVideo } from "../components/CatalogVideoCard";
import {
  build_catalog_rows,
  pick_featured_hero,
  type CatalogContentVideo,
} from "../lib/catalog_layout";
import { is_adult_user } from "../lib/adult_access";
import { extract_cefr_level } from "../lib/badge_styles";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { useUser } from "../context/UserContext";
import { learnerNeedsPlacement, resolvePlacementPhase } from "../lib/learnerOnboarding";
import { userMayUseLearnerApp } from "../lib/subscriptionAccess";
import { catalogScreenStyles as styles } from "./catalog_screen_styles";

type Props = MainTabScreenProps<"Catalog">;

export function CatalogScreen({ navigation }: Props) {
  const { user } = useUser();
  const [videos, setVideos] = useState<CatalogContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const placementPhase = useMemo(
    () => (user ? resolvePlacementPhase(user) : "off"),
    [user],
  );
  const isAdultUser = useMemo(() => is_adult_user(user), [user]);
  const featured = useMemo(() => pick_featured_hero(videos), [videos]);
  const rows = useMemo(() => build_catalog_rows(videos), [videos]);

  const loadVideos = useCallback(async () => {
    const response = await apiFetch("/content-video", { method: "GET" });
    if (!response.ok) {
      throw new Error(await readApiErrorBody(response));
    }
    const data = (await response.json()) as CatalogContentVideo[];
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

  const openVideo = useCallback(
    (card: CatalogCardVideo) => {
      const source = videos.find((video) => video.id === card.id);
      if (!source) {
        return;
      }
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
    },
    [navigation, user, videos],
  );

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

  const featuredLevel = useMemo(() => {
    if (!featured) {
      return null;
    }
    const source = videos.find((video) => video.id === featured.id);
    return extract_cefr_level(source?.content.stats?.systemTags);
  }, [featured, videos]);

  const greeting = user?.name ? user.name : "Learner";

  return (
    <ScreenContainer padded={false}>
      {loading ? (
        <LoadingCenter />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
          contentContainerStyle={styles.scroll}
        >
          <CatalogHomeHeader
            userName={greeting}
            streak={user?.currentStreak ?? 0}
          />

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

          <View style={styles.heroSpacer}>
            <CatalogHero
            featured={featured}
            levelLabel={featuredLevel}
            onStartWatching={() => {
              if (featured) {
                const card = rows.flatMap((row) => row.videos).find((v) => v.id === featured.id);
                if (card) {
                  openVideo(card);
                }
              }
            }}
            />
          </View>

          {rows.length === 0 ? (
            <Text style={styles.empty}>No videos in the catalog yet.</Text>
          ) : (
            rows.map((row) => (
              <CatalogVideoRow
                key={row.title}
                title={row.title}
                description={row.description}
                videos={row.videos}
                isAdultUser={isAdultUser}
                onPressVideo={openVideo}
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
