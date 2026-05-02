import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <View style={[styles.toast, isError ? styles.errorBox : styles.successBox]}>
      <Text style={[styles.text, isError ? styles.errorText : styles.successText]}>
        {message}
      </Text>
      {!!onClose && (
        <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>x</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  successBox: {
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#ABEFC6",
  },
  errorBox: {
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECDCA",
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.danger,
  },
  close: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "800",
  },
});
