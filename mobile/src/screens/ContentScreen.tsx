import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { ContentWatchHeader } from "../components/ContentWatchHeader";
import { AgeBadge, LevelBadge } from "../components/badges/LevelAgeBadges";
import { extract_cefr_level } from "../lib/badge_styles";
import { is_age_restricted_locked } from "../lib/adult_access";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";
import { contentScreenStyles as styles } from "./content_screen_styles";

type ContentVideoPayload = {
  id: number;
  videoName: string;
  videoDescription?: string | null;
  videoLink: string;
  ageRestriction?: string;
  content: {
    id: number;
    category: {
      name: string;
    };
    stats?: {
      systemTags?: string[];
    } | null;
  };
};

type Props = RootStackScreenProps<"Content">;

export function ContentScreen({ route, navigation }: Props) {
  const { contentId, videoId } = route.params;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<ContentVideoPayload | null>(null);

  const isLocked = useMemo(
    () => is_age_restricted_locked(video?.ageRestriction, user),
    [video?.ageRestriction, user],
  );
  const level = useMemo(
    () => extract_cefr_level(video?.content.stats?.systemTags),
    [video?.content.stats?.systemTags],
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const path = videoId
          ? `/content-video/${videoId}`
          : `/content-video?contentId=${contentId}`;
        const response = await apiFetch(path, { method: "GET" });
        if (!response.ok) {
          throw new Error(await readApiErrorBody(response));
        }
        const data = (await response.json()) as ContentVideoPayload | ContentVideoPayload[];
        const resolved = Array.isArray(data)
          ? data.find((item) => item.content.id === contentId) ?? data[0]
          : data;
        if (!resolved?.videoLink) {
          throw new Error("Video not found.");
        }
        setVideo(resolved);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load lesson.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contentId, videoId]);

  const player = useVideoPlayer(video?.videoLink ?? "", (instance) => {
    instance.loop = false;
  });

  useEffect(() => {
    if (!video?.videoLink || isLocked) {
      return;
    }
    player.replace(video.videoLink);
    player.play();
  }, [player, video?.videoLink, isLocked]);

  useEffect(() => {
    if (!video?.id || isLocked) {
      return;
    }
    const markComplete = async () => {
      try {
        await apiFetch(`/content-video/${video.id}/watch-complete`, {
          method: "POST",
          body: JSON.stringify({ progressPercent: 100 }),
        });
        navigation.navigate("LessonSummary", {
          videoId: video.id,
          xpEarned: user?.xp,
        });
      } catch {
        /* non-blocking */
      }
    };
    const sub = player.addListener("playToEnd", () => {
      void markComplete();
    });
    return () => {
      sub.remove();
    };
  }, [player, video?.id, isLocked, navigation, user?.xp]);

  return (
    <ScreenContainer padded={false}>
      <ContentWatchHeader
        onBack={() => navigation.goBack()}
        rightLabel={user ? `${user.xp} XP` : undefined}
      />

      {loading ? (
        <LoadingCenter />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : video ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.playerFrame}>
            {isLocked ? (
              <View style={styles.lockPanel}>
                <Feather name="lock" size={36} color={colors.textMuted} />
                <Text style={styles.lockTitle}>Adults only</Text>
                <Text style={styles.lockBody}>
                  This content is restricted to adults (18+) and is not available on your
                  account.
                </Text>
              </View>
            ) : (
              <VideoView
                player={player}
                style={styles.player}
                nativeControls
                contentFit="contain"
              />
            )}
          </View>

          <View style={styles.meta}>
            <View style={styles.pill}>
              <Text style={styles.category}>{video.content.category.name}</Text>
            </View>
            <Text style={styles.title}>{video.videoName}</Text>
            <View style={styles.badges}>
              {level ? <LevelBadge label={level} /> : null}
              {video.ageRestriction ? <AgeBadge age={video.ageRestriction} /> : null}
            </View>
            {video.videoDescription ? (
              <Text style={styles.description}>{video.videoDescription}</Text>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </ScreenContainer>
  );
}
