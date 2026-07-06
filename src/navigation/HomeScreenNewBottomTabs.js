import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";

const tabIcons = {
  home: require("../assets/home.png"),
  exhibition: require("../assets/exhibition.png"),
  hub: require("../assets/hub.png"),
  profile: require("../assets/my_profile.png"),
};

const tabs = [
  { key: "home", label: "Home", icon: tabIcons.home },
  { key: "exhibition", label: "Exhibition", icon: tabIcons.exhibition },
  { key: "hub", label: "Hub", icon: tabIcons.hub },
  { key: "profile", label: "Profile", icon: tabIcons.profile },
];

export default function HomeScreenNewBottomTabs({ activeTab, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              onPress={() => onTabPress(tab.key)}
              style={styles.tab}
            >
              <Image
                source={tab.icon}
                style={[styles.tabIcon, !active && styles.tabIconInactive]}
                resizeMode="contain"
              />
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.brandBlue,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  tabIcon: {
    width: 22,
    height: 22,
    tintColor: colors.white,
  },
  tabIconInactive: {
    opacity: 0.65,
  },
  label: {
    color: "rgba(255,255,255,0.65)",
    ...textPresets.listItemMeta,
    fontFamily: textPresets.bodyMedium.fontFamily,
  },
  labelActive: {
    color: colors.white,
    fontFamily: textPresets.pageHeaderTitle.fontFamily,
  },
});
