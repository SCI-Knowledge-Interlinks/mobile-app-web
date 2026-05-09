import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function NoDataCard({
  icon = "alert-circle-outline",
  title = "No data found!",
  message = "Please check back later",
  style,
}) {
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={54} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 360,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
});
