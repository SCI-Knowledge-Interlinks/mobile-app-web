import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Header } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function Speakers({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <Header title="Speakers" onBack={onBack} />
      </View>

      <View style={styles.content}>
        <Card style={styles.messageCard}>
          <Text style={styles.messageTitle}>Speaker features coming soon</Text>
          <Text style={styles.messageText}>Speaker profiles and details will be available here.</Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    backgroundColor: colors.green,
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: spacing.md,
  },
  messageCard: {
    alignItems: "center",
    gap: spacing.sm,
  },
  messageTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  messageText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
