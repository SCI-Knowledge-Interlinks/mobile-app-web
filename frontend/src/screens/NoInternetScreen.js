import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Card } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function NoInternetScreen({ onRetry, isRetrying = false }) {
  return (
    <View style={styles.screen}>
      <Card style={styles.card}>
        <Text style={styles.icon}>!</Text>
        <Text style={styles.title}>No internet connection</Text>
        <Text style={styles.message}>
          Please check your connection and try again.
        </Text>
        <Button
          title={isRetrying ? "Checking..." : "Retry"}
          disabled={isRetrying}
          onPress={onRetry}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 54,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
