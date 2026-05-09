import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Entypo from "@expo/vector-icons/Entypo";

import { colors } from "../constants/colors";

const sessionIcon = require("../assets/session.png");
const networkIcon = require("../assets/networking.png");
const profileIcon = require("../assets/profile.png");

const tabs = [
  { key: "home", label: "Home", icon: "home" },
  { key: "sessions", label: "Sessions", imageIcon: sessionIcon },
  { key: "hub", label: "Hub", icon: "grid" },
   { key: "networking", label: "Networking" , imageIcon: networkIcon  },
  { key: "profile", label: "Profile" , imageIcon: profileIcon  },
];

export default function BottomTabs({ activeTab, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => onTabPress(tab.key)}
              style={[styles.tab, active && styles.activeTab]}
            >
              {tab.imageIcon ? (
                <Image
                  source={tab.imageIcon}
                  style={[styles.imageIcon, active && styles.activeImageIcon]}
                  resizeMode="contain"
                />
              ) : (
                <Entypo
                  name={tab.icon}
                  size={24}
                  style={[styles.icon, active && styles.activeText]}
                />
              )}
              <Text style={[styles.label, active && styles.activeText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: "#F2E7E3",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 18,
    elevation: 10,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    minHeight: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#FFF0EC",
  },
  icon: {
    color: "#847A77",
    marginBottom: 4,
  },
  imageIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    tintColor: "#847A77",
  },
  label: {
    color: "#847A77",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  activeText: {
    color: colors.primary,
  },
  activeImageIcon: {
    tintColor: colors.primary,
  },
});
