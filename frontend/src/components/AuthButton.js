import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "../constants/colors";
import { fontFamily } from "../constants/typography";

export default function AuthButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  style,
}) {
  const isSecondary = variant === "secondary";
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primaryBlue : colors.white} />
      ) : (
        <Text style={[styles.text, isSecondary && styles.secondaryText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AuthMethodCard({ icon, title, subtitle, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.methodCard, style]}
    >
      <View style={styles.methodIconWrap}>
        <Ionicons name={icon} size={22} color={colors.primaryBlue} />
      </View>
      <View style={styles.methodTextWrap}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    minHeight: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: colors.primaryBlue,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
  },
  secondaryText: {
    color: colors.primaryBlue,
  },
  methodCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#8399d8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  methodIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 40,
    backgroundColor: "#E9EDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  methodTextWrap: {
    flex: 1,
    gap: 4,
  },
  methodTitle: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  methodSubtitle: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
