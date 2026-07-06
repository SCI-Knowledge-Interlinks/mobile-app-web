import React from "react";
import { StyleSheet, Text, View } from "react-native";

import AuthButton from "../components/AuthButton";
import { colors } from "../constants/colors";
import { commonStyles } from "../styles/commonStyles";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";

export default function NoInternetScreen({ onRetry, isRetrying = false }) {
  return (
    <View style={styles.screen}>
      <View style={[styles.card, commonStyles.cardShadowMd]}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>!</Text>
        </View>
        <Text style={styles.title}>No internet connection</Text>
        <Text style={styles.message}>Please check your connection and try again.</Text>
        <AuthButton
          title={isRetrying ? "Checking..." : "Retry"}
          disabled={isRetrying}
          loading={isRetrying}
          onPress={onRetry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.pageBackground,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8EEF8",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: colors.primaryBlue,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  title: {
    ...textPresets.screenTitle,
    color: colors.text,
    fontSize: 22,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
