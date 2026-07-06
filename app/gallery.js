import React from "react";
import { router } from "expo-router";

import GalleryScreen from "../src/screens/GalleryScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getGallery } from "../src/services/eventService";

export default function GalleryRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(() => getGallery(), []);

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  return (
    <GalleryScreen
      galleryAlbums={data || []}
      isLoading={isLoading}
      onBack={() => router.back()}
    />
  );
}
