import React from "react";
import { ActivityIndicator, Linking, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard, { InfoOutlineButton } from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const INTERLINKS_URL = "https://interlinx.com/";

const assets = {
  banner: require("../assets/b2b_banner.jpg"),
};

const DEFAULT_BODY =
  "The InterlinX one-on-one partnering tool facilitates targeted B2B meetings at the summit.";

export default function B2BPartneringScreen({ content = null, isLoading = false, onBack }) {
  const insets = useSafeAreaInsets();
  const bannerSource = content?.bannerUrl ? { uri: content.bannerUrl } : assets.banner;
  const loginUrl = content?.loginUrl || INTERLINKS_URL;

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="B2B partnering" onBack={onBack} />
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
              heading={content?.heading || "InterlinX (B2B Partnering)"}
              body={content?.body || DEFAULT_BODY}
              footer={
                <InfoOutlineButton onPress={() => Linking.openURL(loginUrl)}>
                  Login to Interlinks
                </InfoOutlineButton>
              }
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
