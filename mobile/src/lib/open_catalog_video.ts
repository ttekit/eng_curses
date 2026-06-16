import { useCallback } from "react";
import { Alert } from "react-native";
import type { CatalogCardVideo } from "../components/CatalogVideoCard";
import type { CatalogContentVideo } from "../lib/catalog_layout";
import type { UserData } from "../types/user";
import { learnerNeedsPlacement } from "./learnerOnboarding";

type ContentNavigation = {
  navigate: (
    screen: "Content",
    params: { contentId: number; videoId?: number },
  ) => void;
};

type OpenCatalogVideoParams = {
  card: CatalogCardVideo;
  videos: readonly CatalogContentVideo[];
  user: UserData | null;
  navigation: ContentNavigation;
};

export function open_catalog_video({
  card,
  videos,
  user,
  navigation,
}: OpenCatalogVideoParams): void {
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
  navigation.navigate("Content", {
    contentId: source.content.id,
    videoId: source.id,
  });
}

export function use_open_catalog_video(
  videos: readonly CatalogContentVideo[],
  user: UserData | null,
  navigation: ContentNavigation | undefined,
) {
  return useCallback(
    (card: CatalogCardVideo) => {
      if (!navigation) {
        return;
      }
      open_catalog_video({ card, videos, user, navigation });
    },
    [navigation, user, videos],
  );
}
