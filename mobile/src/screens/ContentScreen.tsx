import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { colors } from "../theme/colors";

type ContentVideoPayload = {
  id: number;
  videoName: string;
  videoDescription?: string | null;
  videoLink: string;
  content: {
    id: number;
    category: {
      name: string;
    };
  };
};

type Props = RootStackScreenProps<"Content">;

export function ContentScreen({ route, navigation }: Props) {
  const { contentId, videoId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<ContentVideoPayload | null>(null);

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
    if (!video?.videoLink) {
      return;
    }
    player.replace(video.videoLink);
    player.play();
  }, [player, video?.videoLink]);

  useEffect(() => {
    if (!video?.id) return;
    const markComplete = async () => {
      try {
        await apiFetch(`/content-video/${video.id}/watch-complete`, {
          method: "POST",
          body: JSON.stringify({ progressPercent: 100 }),
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
  }, [player, video?.id]);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.topBar}>
        <AppButton
          label="Back"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : video ? (
        <ScrollView contentContainerStyle={styles.content}>
          <VideoView player={player} style={styles.player} nativeControls contentFit="contain" />
          <View style={styles.meta}>
            <Text style={styles.category}>{video.content.category.name}</Text>
            <Text style={styles.title}>{video.videoName}</Text>
            {video.videoDescription ? (
              <Text style={styles.description}>{video.videoDescription}</Text>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  content: {
    paddingBottom: 32,
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  meta: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  category: {
    color: colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  description: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
