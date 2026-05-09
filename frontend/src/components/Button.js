import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  style,
}) {
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isSecondary ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, isSecondary && styles.secondaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 55,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryText: {
    color: colors.text,
  },
});
