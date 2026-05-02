import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Header } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function Networking() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <Header
          title="Networking"
          rightContent={
            <View style={styles.headerActions}>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
                <MaterialIcons name="notifications-none" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
                <MaterialIcons name="chat" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <View style={styles.content}>
        <Card style={styles.messageCard}>
          <Text style={styles.messageTitle}>Networking features coming soon</Text>
          <Text style={styles.messageText}>Connect, discover, and meet attendees here soon.</Text>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
