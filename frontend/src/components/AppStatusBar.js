import React from "react";
import { Platform, StatusBar, View } from "react-native";

import { colors } from "../constants/colors";
import { useTopSafeInset } from "../hooks/useTopSafeInset";

export const STATUS_BAR_COLOR = colors.brandBlue;

export default function AppStatusBar({ backgroundColor = STATUS_BAR_COLOR }) {
  const topInset = useTopSafeInset();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={Platform.OS === "android"}
      />
      {topInset > 0 ? (
        <View style={{ height: topInset, backgroundColor }} />
      ) : null}
    </>
  );
}
