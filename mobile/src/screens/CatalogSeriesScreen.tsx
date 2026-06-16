import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { ContentWatchHeader } from "../components/ContentWatchHeader";
import {
  parse_series_playlist_payload,
  type SeriesPlaylistPayload,
} from "../lib/catalog_playlist";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"CatalogSeries">;

export function CatalogSeriesScreen({ navigation, route }: Props) {
  const { friendlyLink, contentId } = route.params;
  const [payload, setPayload] = useState<SeriesPlaylistPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(
          `/contents/series/${encodeURIComponent(friendlyLink)}`,
          { method: "GET" },
        );
        if (!response.ok) {
          throw new Error(await readApiErrorBody(response));
        }
        const data = await response.json();
        setPayload(parse_series_playlist_payload(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load series.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [friendlyLink]);

  return (
    <ScreenContainer padded={false}>
      <ContentWatchHeader onBack={() => navigation.goBack()} />
      {loading ? (
        <LoadingCenter />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={payload?.episodes ?? []}
          keyExtractor={(item) => String(item.contentVideoId)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>{payload?.name ?? "Series"}</Text>
              {payload?.description ? (
                <Text style={styles.description}>{payload.description}</Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate("Content", {
                  contentId,
                  videoId: item.contentVideoId,
                })
              }
            >
              <Text style={styles.index}>{item.index}</Text>
              <View style={styles.meta}>
                <Text style={styles.episodeTitle}>{item.videoName}</Text>
                {item.videoDescription ? (
                  <Text style={styles.episodeBody} numberOfLines={2}>
                    {item.videoDescription}
                  </Text>
                ) : null}
              </View>
              <Feather name="play-circle" size={22} color={colors.primary} />
            </Pressable>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screenPadding,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  list: {
    padding: spacing.screenPadding,
    gap: 10,
    paddingBottom: 32,
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
  },
  index: {
    ...typography.bodySemiBold,
    color: colors.primary,
    width: 24,
    textAlign: "center",
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  episodeTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  episodeBody: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
