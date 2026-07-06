import React, { useMemo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "../constants/typography";
import { DEFAULT_VENUE } from "../utils/eventHomeMapper";
import { useTopSafeInset } from "../hooks/useTopSafeInset";

export const SPLASH_BACKGROUND_COLOR = "#000227";
export const SPLASH_MIN_DURATION_MS = 2500;

const gradientColors = ["#000227", "#00021D", "#00021D", "#020545"];
const gradientLocations = [0, 0.35, 0.7, 1];

const colors = {
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.88)",
};

const content = {
  tagline: "Towards Safe, Smart, Sustainable \nPassenger Mobility",
  date: "9-11 July, 2026",
  location: DEFAULT_VENUE.address,
  supportedByLabel: "Supported By",
};

const assets = {
  splashAppLogo: require("../assets/splash-app-logo.png"),
  illustration: require("../assets/splash_icon.png"),
  boci: require("../assets/boci-light.png"),
  supportedBy: require("../assets/supportedbylogo.png"),
  // calendarIcon: require("../assets/calendar_icon.png"),
  // locationIcon: require("../assets/location_icon.png"),
};

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const topInset = useTopSafeInset();
  const { width, height } = useWindowDimensions();

  const layout = useMemo(() => {
    const contentWidth = Math.min(width - 32, 420);
    const isCompact = height < 720;

    return {
      contentWidth,
      illustrationHeight: isCompact ? height * 0.28 : height * 0.32,
      bociWidth: Math.min(contentWidth * 0.72, 300),
      bociHeight: isCompact ? 64 : 72,
      supportedByWidth: contentWidth,
      supportedByHeight: isCompact ? 84 : 96,
    };
  }, [width, height]);

  return (
    <View style={styles.root}>
    <LinearGradient
      colors={gradientColors}
      locations={gradientLocations}
      style={StyleSheet.absoluteFillObject}
    />
    <View style={[styles.screen, { paddingTop: topInset, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: height - topInset - Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={[styles.content, { width: layout.contentWidth }]}>
          <Image
            source={assets.splashAppLogo}
            style={styles.splashLogo}
            resizeMode="contain"
          />

          <Text style={styles.tagline}>{content.tagline}</Text>

          <MetaRow
            iconName="calendar-outline"
            customIcon={assets.calendarIcon}
            label={content.date}
          />
          <MetaRow
            iconName="location-outline"
            customIcon={assets.locationIcon}
            label={content.location}
          />

          <Image
            source={assets.illustration}
            style={[styles.illustration, { height: layout.illustrationHeight }]}
            resizeMode="contain"
          />

          <View style={styles.footer}>
            <Image
              source={assets.boci}
              style={[
                styles.bociLogo,
                { width: layout.bociWidth, height: layout.bociHeight },
              ]}
              resizeMode="contain"
            />

            {/* <Text style={styles.supportedByLabel}>{content.supportedByLabel}</Text> */}

            <Image
              source={assets.supportedBy}
              style={[
                styles.supportedByLogos,
                {
                  width: layout.supportedByWidth,
                  height: layout.supportedByHeight,
                },
              ]}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>
    </View>
    </View>
  );
}

function MetaRow({ iconName, customIcon, label }) {
  return (
    <View style={styles.metaRow}>
      {customIcon ? (
        <Image source={customIcon} style={styles.metaIconImage} resizeMode="contain" />
      ) : (
        <Ionicons name={iconName} size={16} color={colors.text} style={styles.metaIcon} />
      )}
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND_COLOR,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  splashLogo: {
    width: 320,
    height: 96,
    marginBottom: 4,
  },
  tagline: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  metaIcon: {
    width: 18,
  },
  metaIconImage: {
    width: 16,
    height: 16,
  },
  metaText: {
    color: colors.textMuted,
    fontFamily: fontFamily.light,
    fontSize: 16,
    lineHeight: 22,
  },
  illustration: {
    width: "100%",
    marginVertical: 8,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  bociLogo: {
    marginBottom: 2,
  },
  supportedByLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  supportedByLogos: {
    marginTop: 2,
  },
});
