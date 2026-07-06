import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { commonStyles } from "../styles/commonStyles";

export default function Card({ children, style }) {
  return <View style={[styles.card, commonStyles.shadow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: spacing.md,
  },
});
