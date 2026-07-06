import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import AppStatusBar from "./AppStatusBar";
import { colors } from "../constants/colors";
import { MOBILE_MAX_WIDTH } from "../constants/layout";
import { textPresets } from "../constants/typography";

export default function ScreenPageHeader({
  title,
  onBack,
  centered = true,
  backgroundColor = colors.pageBackground,
}) {
  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <AppStatusBar />
      <View style={styles.bar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        {centered ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Text style={styles.titleLeft} numberOfLines={1}>
            {title}
          </Text>
        )}
        <View style={styles.backButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  bar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    ...Platform.select({
      web: {
        width: "100%",
        maxWidth: MOBILE_MAX_WIDTH,
        alignSelf: "center",
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    ...textPresets.pageHeaderTitle,
    color: colors.text,
  },
  titleLeft: {
    flex: 1,
    ...textPresets.pageHeaderTitleLeft,
    color: colors.text,
    paddingLeft: 4,
  },
});
