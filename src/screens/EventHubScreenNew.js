import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const assets = {
  exhibition: require("../assets/exhibition.png"),
  conference: require("../assets/conference.png"),
  awards: require("../assets/awards.png"),
  speakers: require("../assets/speakers.png"),
  b2b: require("../assets/b2b.png"),
  "floor-plan": require("../assets/floor-plan.png"),
  gallery: require("../assets/gallery.png"),
  boci: require("../assets/boci.png"),
  badgeScanner: require("../assets/id_card.png"),
};

const HUB_TINTED_ICON_KEYS = new Set(["badge-scanner", "awards"]);

const hubItems = [
  { key: "badge-scanner", label: "Badge Scanner", icon: assets.badgeScanner },
  { key: "exhibition", label: "Exhibition", icon: assets.exhibition },
  { key: "conference", label: "Conference", icon: assets.conference },
  { key: "awards", label: "Awards", icon: assets.awards },
  { key: "speakers", label: "Speakers", icon: assets.speakers },
  { key: "b2b", label: "B2B Partnering", icon: assets.b2b },
  { key: "floor-plan", label: "Floor Plan", icon: assets["floor-plan"] },
  { key: "gallery", label: "Gallery", icon: assets.gallery },
  { key: "boci", label: "BOCI", icon: assets.boci },
];

export default function EventHubScreenNew({
  onBack,
  onOpenBadgeScanner,
  onOpenExhibition,
  onOpenConference,
  onOpenAwards,
  onOpenSpeakers,
  onOpenB2BPartnering,
  onOpenFloorPlan,
  onOpenBociPartner,
  onOpenGallery,
}) {
  const insets = useSafeAreaInsets();

  const handleItemPress = (key) => {
    switch (key) {
      case "badge-scanner":
        onOpenBadgeScanner?.();
        break;
      case "exhibition":
        onOpenExhibition?.();
        break;
      case "conference":
        onOpenConference?.();
        break;
      case "awards":
        onOpenAwards?.();
        break;
      case "speakers":
        onOpenSpeakers?.();
        break;
      case "b2b":
        onOpenB2BPartnering?.();
        break;
      case "floor-plan":
        onOpenFloorPlan?.();
        break;
      case "boci":
        onOpenBociPartner?.();
        break;
      case "gallery":
        onOpenGallery?.();
        break;
      default:
        break;
    }
  };

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="More" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: scrollBottomPadding(insets, spacing.md) },
        ]}
      >
        {hubItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.85}
            onPress={() => handleItemPress(item.key)}
            style={styles.listCard}
          >
            <Image
              source={item.icon}
              style={[
                styles.listIcon,
                HUB_TINTED_ICON_KEYS.has(item.key) && styles.listIconTinted,
              ]}
              resizeMode="contain"
            />
            <Text style={styles.listLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.brandBlue} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm + 2,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...commonStyles.cardShadow,
    gap: spacing.sm + 4,
  },
  listIcon: {
    width: 28,
    height: 28,
  },
  listIconTinted: {
    tintColor: colors.brandBlue,
  },
  listLabel: {
    flex: 1,
    ...textPresets.hubItemLabel,
    color: colors.text,
  },
});
