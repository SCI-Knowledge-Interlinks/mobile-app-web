import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { fontFamily, textPresets } from "../constants/typography";

const COLOR_SCHEMES = {
  profile: {
    border: colors.profileBlue,
    text: colors.profileBlue,
    borderRadius: 8,
  },
  brand: {
    border: colors.brandBlue,
    text: colors.brandBlue,
    borderRadius: 10,
  },
  neutral: {
    border: colors.brandBlue,
    text: colors.black,
    borderRadius: 14,
  },
};

export default function ActionButton({
  title,
  onPress,
  disabled = false,
  variant = "outline",
  color = "brand",
  style,
}) {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.brand;
  const isCompact = variant === "compact";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        isCompact ? styles.compact : styles.outline,
        {
          borderColor: scheme.border,
          borderRadius: scheme.borderRadius,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          isCompact ? styles.compactText : styles.outlineText,
          { color: scheme.text },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  outline: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  compact: {
    width: "100%",
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  outlineText: {
    ...textPresets.outlineButton,
    textAlign: "center",
  },
  compactText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
});
