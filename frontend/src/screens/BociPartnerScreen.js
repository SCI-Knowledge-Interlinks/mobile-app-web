import React from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const assets = {
  banner: require("../assets/boci_banner.jpg"),
};

const DEFAULT_BODY =
  "BOCI is the apex body representing bus and car operators across India.";

export default function BociPartnerScreen({ content = null, isLoading = false, onBack }) {
  const insets = useSafeAreaInsets();
  const bannerSource = content?.bannerUrl ? { uri: content.bannerUrl } : assets.banner;

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="BOCI" onBack={onBack} />
      {isLoading ? (
        <View style={commonStyles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: scrollBottomPadding(insets) }}
        >
          <View style={commonStyles.bannerWrap}>
            <InfoDetailCard
              variant="banner"
              bannerSource={bannerSource}
              heading={content?.heading || "Bus & Car Operators Confederation of India"}
              headingCentered
              body={content?.body || DEFAULT_BODY}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
