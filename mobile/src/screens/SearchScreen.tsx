import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { MainTabScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { LoadingCenter } from "../components/LoadingCenter";
import { CatalogVideoCard } from "../components/CatalogVideoCard";
import { to_card_video, type CatalogContentVideo } from "../lib/catalog_layout";
import { is_adult_user } from "../lib/adult_access";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { use_open_catalog_video } from "../lib/open_catalog_video";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";
import { searchScreenStyles as styles } from "./search_screen_styles";

type Props = MainTabScreenProps<"Search">;

const trendingSearches = [
  "Job interviews",
  "Past tense",
  "Ordering food",
  "Phrasal verbs",
  "Small talk",
];

export function SearchScreen({ navigation }: Props) {
  const { user } = useUser();
  const [videos, setVideos] = useState<CatalogContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const openVideo = use_open_catalog_video(videos, user, navigation.getParent() ?? undefined);
  const cards = useMemo(() => videos.map(to_card_video), [videos]);
  const categories = useMemo(() => {
    const names = new Set(cards.map((card) => card.categoryLabel));
    return ["All", ...Array.from(names).sort()];
  }, [cards]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesCategory =
        activeCategory === "All" || card.categoryLabel === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        card.title.toLowerCase().includes(normalizedQuery) ||
        card.categoryLabel.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, cards, query]);
  const isAdultUser = useMemo(() => is_adult_user(user), [user]);

  const loadVideos = useCallback(async () => {
    const response = await apiFetch("/content-video", { method: "GET" });
    if (!response.ok) {
      throw new Error(await readApiErrorBody(response));
    }
    const data = (await response.json()) as CatalogContentVideo[];
    setVideos(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await loadVideos();
      } catch (err) {
        Alert.alert(
          "Search",
          err instanceof Error ? err.message : "Could not load videos.",
        );
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [loadVideos]);

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingCenter />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchWrap}>
          <Feather
            name="search"
            size={16}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search videos, topics, words..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            style={styles.input}
          />
          {query ? (
            <Pressable
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
              style={styles.clearButton}
            >
              <Feather name="x" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map((item) => {
            const active = activeCategory === item;
            return (
              <Pressable
                key={item}
                onPress={() => setActiveCategory(item)}
                style={[styles.chip, active ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {!query ? (
          <View>
            <View style={styles.trendingHeader}>
              <Feather name="trending-up" size={16} color={colors.primary} />
              <Text style={styles.trendingTitle}>Trending searches</Text>
            </View>
            <View style={styles.trendingWrap}>
              {trendingSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setQuery(term)}
                  style={styles.trendingChip}
                >
                  <Text style={styles.trendingText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        <Text style={styles.resultCount}>
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </Text>
        <View style={styles.grid}>
          {filtered.map((card) => (
            <View key={card.id} style={styles.gridItem}>
              <CatalogVideoCard
                video={card}
                isAdultUser={isAdultUser}
                onPress={() => openVideo(card)}
                gradientSeed={card.id}
              />
              <Text style={styles.gridCategory}>{card.categoryLabel}</Text>
            </View>
          ))}
        </View>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No videos match your search.</Text>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
