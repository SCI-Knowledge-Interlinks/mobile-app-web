import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { commonStyles } from "../styles/commonStyles";

export default function Input({
  label,
  error,
  style,
  inputStyle,
  ...textInputProps
}) {
  return (
    <View style={[styles.wrapper, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        {...textInputProps}
        style={[
          styles.input,
          commonStyles.webInputReset,
          error && styles.inputError,
          inputStyle,
        ]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    width: "100%",
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});
