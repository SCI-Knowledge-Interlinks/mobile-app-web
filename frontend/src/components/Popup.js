import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import Button from "./Button";
import Card from "./Card";

export default function Popup({
  visible,
  title,
  message,
  children,
  primaryLabel = "OK",
  secondaryLabel,
  onPrimary,
  onSecondary,
}) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Card style={styles.card}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {!!message && <Text style={styles.message}>{message}</Text>}
        {children}
        <View style={styles.actions}>
          {!!secondaryLabel && (
            <Button title={secondaryLabel} variant="secondary" onPress={onSecondary} />
          )}
          <Button title={primaryLabel} onPress={onPrimary} />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 8,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
  },
});
