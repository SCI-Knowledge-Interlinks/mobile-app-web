import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

const backIcon = require("../assets/back.png");

export default function Header({ title, onBack, rightAction, rightLabel, rightContent }) {
  const hasRightContent = !!rightContent;

  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          style={[styles.iconButton, hasRightContent && styles.wideSide]}
        >
          <Image source={backIcon} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
      ) : (
        <View style={[styles.iconButton, hasRightContent && styles.wideSide]} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {rightContent ? (
        <View style={[styles.rightContent, styles.wideSide]}>{rightContent}</View>
      ) : rightAction ? (
        <TouchableOpacity activeOpacity={0.8} onPress={rightAction} style={styles.rightButton}>
          <Text style={styles.rightText}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.green,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  wideSide: {
    width: 88,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  title: {
    flex: 1,
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  rightButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContent: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rightText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
