import React from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const galleryCardImage = require("../assets/gallery_image.png");

const fallbackAlbums = [
  { id: "1", title: "Curtain Raiser @ Chennai", image: galleryCardImage },
];

export default function GalleryScreen({
  galleryAlbums = fallbackAlbums,
  isLoading = false,
  onBack,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Gallery" onBack={onBack} />
      {isLoading ? (
        <View style={commonStyles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            commonStyles.newScrollContent,
            { paddingBottom: scrollBottomPadding(insets) },
          ]}
        >
          {galleryAlbums.map((album) => (
            <InfoDetailCard
              key={album.id}
              variant="gallery"
              galleryImageSource={
                album.imageUrl ? { uri: album.imageUrl } : album.image || galleryCardImage
              }
              galleryTitle={album.title}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
