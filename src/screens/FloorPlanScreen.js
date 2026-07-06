import React from "react";
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const assets = {
  floorPlan: require("../assets/floorplan_map.png"),
};

export default function FloorPlanScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - spacing.xl, 760);

  return (
    <View style={commonStyles.newScreenSoft}>
      <ScreenPageHeader title="Event Floor Plan" onBack={onBack} backgroundColor={colors.pageBackgroundSoft} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        <View style={[styles.card, { width: contentWidth }]}>
          <Image source={assets.floorPlan} style={styles.floorPlanImage} resizeMode="contain" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.sm + 2,
    ...commonStyles.cardShadow,
  },
  floorPlanImage: {
    width: "100%",
    height: 520,
  },
});
