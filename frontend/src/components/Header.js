import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../constants/colors";
import { topSectionStyles } from "../styles/topSectionStyles";

export default function Header({
  title,
  onBack,
  rightAction,
  rightLabel,
  rightContent,
  children,
  contentWidth,
  style,
  topBarStyle,
  titleRowStyle,
  titleStyle,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[topSectionStyles.topSection, { paddingTop: insets.top + 16 }, style]}>
      <View style={[topSectionStyles.topInner, contentWidth && { maxWidth: contentWidth }]}>
        <View style={[topSectionStyles.topBar, topBarStyle]}>
          <View style={[topSectionStyles.titleRow, titleRowStyle]}>
            {onBack ? (
              <TouchableOpacity activeOpacity={0.8} onPress={onBack} style={topSectionStyles.backButton}>
                <MaterialIcons name="arrow-back-ios" size={22} color={colors.white} />
              </TouchableOpacity>
            ) : null}

            <Text style={[topSectionStyles.screenTitle, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {rightContent ? (
            <View style={styles.rightContent}>{rightContent}</View>
          ) : rightAction ? (
            <TouchableOpacity activeOpacity={0.8} onPress={rightAction} style={styles.rightButton}>
              <Text style={styles.rightText}>{rightLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rightButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  rightText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
