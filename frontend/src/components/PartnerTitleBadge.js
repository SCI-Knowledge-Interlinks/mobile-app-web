import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";

export default function PartnerTitleBadge({
  title,
  style,
  backgroundColor = colors.cardFooterDark,
  placement = "seam",
}) {
  if (!title) return null;

  const wrapStyle = placement === "bottom" ? styles.badgeWrapBottom : styles.badgeWrapSeam;

  return (
    <View style={[wrapStyle, style]}>
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={styles.badgeText} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeWrapSeam: {
    alignItems: "center",
    marginTop: -14,
    marginBottom: -14,
    zIndex: 2,
  },
  badgeWrapBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -14,
    alignItems: "center",
    zIndex: 2,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: spacing.sm - 2,
  },
  badgeText: {
    ...textPresets.caption,
    fontFamily: textPresets.caption.fontFamily,
    fontSize: 13,
    color: colors.white,
    textAlign: "center",
  },
});
