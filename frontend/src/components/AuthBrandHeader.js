import React from "react";
import { Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "../constants/colors";
import { MOBILE_MAX_WIDTH } from "../constants/layout";
import { getAppContentWidth } from "../hooks/useAppContentWidth";

const LOGO_ROW_GAP = 8;
const APP_LOGO_SHARE = 0.55;
const BOCI_LOGO_SHARE = 0.45;
const APP_LOGO_ASPECT = 192 / 59;
const BOCI_LOGO_ASPECT = 2.8;

const assets = {
  appLogo: require("../assets/app_logo.png"),
  bociLogo: require("../assets/boci-dark.png"),
};

export default function AuthBrandHeader({ showBack = true, onBack, logoMarginTop = 20 }) {
  const { width } = useWindowDimensions();
  const contentWidth = getAppContentWidth(width, 40);
  const rowInnerWidth = contentWidth - LOGO_ROW_GAP;
  const appLogoWidth = rowInnerWidth * APP_LOGO_SHARE;
  const appLogoHeight = appLogoWidth / APP_LOGO_ASPECT;
  const bociLogoWidth = rowInnerWidth * BOCI_LOGO_SHARE;
  const bociLogoHeight = bociLogoWidth / BOCI_LOGO_ASPECT;

  return (
    <>
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      ) : null}

      <View style={[styles.logoRow, { width: contentWidth, marginTop: 50 }]}>
        <Image
          source={assets.appLogo}
          style={{ width: appLogoWidth, height: appLogoHeight }}
          resizeMode="contain"
        />
        <Image
          source={assets.bociLogo}
          style={{ width: bociLogoWidth, height: bociLogoHeight }}
          resizeMode="contain"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 12,
    marginTop: 4,
    padding: 4,
  },
  logoRow: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: LOGO_ROW_GAP,
  },
});
