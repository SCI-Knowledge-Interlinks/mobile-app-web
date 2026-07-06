import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { MOBILE_MAX_WIDTH } from "../constants/layout";

export default function MobileAppShell({ children }) {
  if (Platform.OS !== "web") {
    return children;
  }

  return (
    <View style={styles.webRoot}>
      <View style={styles.webFrame}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    alignItems: "center",
    backgroundColor: "#DDE3EC",
  },
  webFrame: {
    flex: 1,
    width: "100%",
    maxWidth: MOBILE_MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      },
    }),
  },
});
