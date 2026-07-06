import React from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const assets = {
  banner: require("../assets/awards_banner.jpg"),
};

const AWARDS_BODY =
  "The Bharat Prawaas Awards mark a significant milestone in recognising excellence across India's public transport sector.";

export default function AwardsScreen({ content = null, isLoading = false, onBack }) {
  const insets = useSafeAreaInsets();
  const bannerSource = content?.bannerUrl ? { uri: content.bannerUrl } : assets.banner;

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Bharat Prawaas Awards 2026" onBack={onBack} />
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
              bannerHeight={240}
              body={content?.body || AWARDS_BODY}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
