import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Toast } from "../components";
import BottomTabs from "../navigation/BottomTabs";
import { colors } from "../constants/colors";
import { layout } from "../constants/layout";
import { spacing } from "../constants/spacing";
import EventHub from "./EventHub";
import EventSessions from "./EventSessions";
import Networking from "./Networking";
import ProfileScreen from "./ProfileScreen";

const appLogo = require("../assets/app_logo.png");
const partnerLogo = require("../assets/home_logo.png");
const userIcon = require("../assets/profile.png");
const festivalBanner = require("../assets/banner1.jpeg");
const venueImage = require("../assets/banner2.jpeg");

const actionButtons = [
  { icon: "qr-code-scanner" },
  { icon: "notifications-none" },//, badge: "3"
  { icon: "chat" },
];

const transportModes = [
  { title: "BUS", icon: "directions-bus", color: "#0F9D58" },
  { title: "CAR", icon: "directions-car", color: "#F4511E" },
  { title: "METRO", icon: "directions-transit", color: "#1A73E8" },
  { title: "LEVs", icon: "bolt", color: "#F4B400" },
];

const quickLinks = [
  { title: "Speakers", icon: "groups", color: "#7430C4", bg: "#F3EAFE" },
  { title: "Exhibition", icon: "storefront", color: "#128A43", bg: colors.successLight },
  { title: "My Calendar", icon: "event", color: "#F4511E", bg: "#FFF2E7" },
  { title: "Help Desk", icon: "support-agent", color: "#1A73E8", bg: "#EAF4FF" },
];

const sponsors = [
  { title: "TECHCORP", icon: "verified-user", color: "#1D5FAF" },
  { title: "NEXUS AI", icon: "hub", color: "#008D7A" },
  { title: "QUANTUM", icon: "alternate-email", color: "#7430C4" },
  { title: "INFRALINK", icon: "link", color: "#F4511E" },
];

const socialLinks = [
  { title: "Instagram", icon: "instagram", url: "https://www.instagram.com/" },
  { title: "Facebook", icon: "facebook", url: "https://www.facebook.com/" },
  { title: "X", icon: "logo-x", iconSet: "ionicons", url: "https://x.com/" },
  { title: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/" },
  { title: "YouTube", icon: "youtube-play", url: "https://www.youtube.com/" },
];

const venueName = "Helipad Exhibition Centre";
const venueAddress = "HEC, Gandhinagar, Gujarat";
const venueQuery = `${venueName}, ${venueAddress}`;
const venueMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueQuery)}`;
const venueDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueQuery)}`;
const venueEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(venueQuery)}&z=16&t=k&output=embed`;
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const venueStaticMapUrl = googleMapsApiKey
  ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(venueQuery)}&zoom=16&size=720x320&scale=2&maptype=satellite&markers=color:red%7C${encodeURIComponent(venueQuery)}&key=${googleMapsApiKey}`
  : null;

export default function HomeScreen({
  user,
  initialActiveTab = "home",
  sessionFilters = {},
  initialBookmarkedSessionIds = [],
  onEditProfile,
  onOpenSpeakers,
  onOpenCalendar,
  onOpenSpeakerInfo,
  onOpenSessionDetails,
  onOpenSessionFilter,
  onLogout,
  onProfilePhotoSelected,
}) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [expanded, setExpanded] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [bookmarkedSessionIds, setBookmarkedSessionIds] = useState(initialBookmarkedSessionIds);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 760);
  const isCompact = width < 560;

  useEffect(() => {
    if (initialActiveTab) setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  useEffect(() => {
    setBookmarkedSessionIds(initialBookmarkedSessionIds);
  }, [initialBookmarkedSessionIds.join(",")]);

  const toggleSessionBookmark = (sessionId) => {
    setBookmarkedSessionIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId]
    );
  };

  const handleTabPress = (tab) => {
    setActiveTab(
      ["home", "sessions", "hub", "networking", "profile"].includes(tab)
        ? tab
        : "home"
    );
  };

  const handleQuickLinkPress = (title) => {
    if (title === "Speakers") {
      onOpenSpeakers?.();
      return;
    }

    if (title === "My Calendar") {
      onOpenCalendar?.();
      return;
    }
  };

  if (activeTab === "sessions") {
    return (
      <View style={styles.screen}>
        <EventSessions
          filters={sessionFilters}
          bookmarkedSessionIds={bookmarkedSessionIds}
          onBack={() => setActiveTab("home")}
          onOpenSessionDetails={(session) =>
          onOpenSessionDetails?.({
              ...session,
              isBookmarked: bookmarkedSessionIds.includes(session.id),
            })
          }
          onOpenFilter={() => onOpenSessionFilter?.(bookmarkedSessionIds, sessionFilters)}
          onToggleBookmark={toggleSessionBookmark}
        />
        <BottomTabs activeTab="sessions" onTabPress={handleTabPress} />
      </View>
    );
  }

  if (activeTab === "hub") {
    return (
      <View style={styles.screen}>
        <EventHub />
        <BottomTabs activeTab="hub" onTabPress={handleTabPress} />
      </View>
    );
  }

  if (activeTab === "networking") {
    return (
      <View style={styles.screen}>
        <Networking onOpenSpeakerInfo={onOpenSpeakerInfo} />
        <BottomTabs activeTab="networking" onTabPress={handleTabPress} />
      </View>
    );
  }

  if (activeTab === "profile") {
    return (
      <View style={styles.screen}>
        <ProfileScreen
          embedded
          user={user}
          onEditProfile={onEditProfile}
          onLogout={onLogout}
          onProfilePhotoSelected={onProfilePhotoSelected}
        />
        <BottomTabs activeTab="profile" onTabPress={handleTabPress} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.topSection, { paddingTop: insets.top + 16 }]}>
          <View style={[styles.heroInner, { maxWidth: contentWidth }]}>
            <View style={styles.headerRow}>
              <Image
                source={appLogo}
                style={[styles.logo, isCompact && styles.logoCompact]}
                resizeMode="contain"
              />

              <View style={styles.actionRow}>
                {actionButtons.map((item) => (
                  <TouchableOpacity
                    key={item.icon}
                    activeOpacity={0.75}
                    style={[styles.actionButton, isCompact && styles.actionButtonCompact]}
                  >
                    <MaterialIcons name={item.icon} size={24} color={colors.white} />
                    {item.badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[styles.actionButton, isCompact && styles.actionButtonCompact]}
                >
                  <Image source={userIcon} style={styles.actionImage} resizeMode="contain" />
                </TouchableOpacity>
              
              </View>
              
            </View>
            {/* <View style={styles.partnerCard}> */}
            <Image source={partnerLogo} style={styles.partnerLogo} resizeMode="contain" />
          {/* </View>  */}
          </View>
        </View>

        <View style={[styles.mainContent, { maxWidth: contentWidth }]}>
          <Toast message={quickMessage} onClose={() => setQuickMessage("")} />

          <FeaturedEventCard
            isCompact={isCompact}
            onExploreEvent={() => setActiveTab("sessions")}
          />

          

          

          <Card style={styles.card}>
            <View style={[styles.aboutRow, isCompact && styles.aboutRowCompact]}>
              <View style={styles.aboutCopy}>
                <SectionHeader title="ABOUT EVENT" />
                <Text style={styles.eventTitle}>STEERING THE NATION TOWARDS VIKSIT BHARAT</Text>
                <Text style={styles.bodyText} numberOfLines={expanded ? undefined : 5}>
                  Prawaas 5.0 aims to bring stakeholders together to expand services,
                  modernise infrastructure, and enable inclusive access through a truly
                  multimodal approach integrating buses, metro, taxis, and last-mile
                  solutions. The event aligns government, operators, startups,
                  technology providers, financiers, and civil society to build a
                  mobility ecosystem that is efficient, inclusive, climate-conscious,
                  and future-ready.
                </Text>
              </View>
              <View style={[styles.aboutIllustration, isCompact && styles.aboutIllustrationCompact]}>
                <Image source={venueImage} style={styles.aboutImage} resizeMode="cover" />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.8}
              style={styles.readMoreButton}
            >
              <Text style={styles.linkText}>{expanded ? "Read Less" : "Read More"}</Text>
              <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Card>

          <Card style={styles.card}>
            <SectionHeader title="QUICK ACCESS" />
            <View style={styles.quickGrid}>
              {quickLinks.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.85}
                  onPress={() => handleQuickLinkPress(item.title)}
                  style={[
                    styles.quickCard,
                    isCompact && styles.quickCardCompact,
                    { backgroundColor: item.bg },
                  ]}
                >
                  <MaterialIcons name={item.icon} size={34} color={item.color} />
                  <Text style={styles.quickTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab("hub")}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreText}>Explore More</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </Card>

          <Card style={styles.card}>
            <View style={styles.sectionRow}>
              <SectionHeader title="SPONSORS & PARTNERS" compact />
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sponsorGrid}>
              {sponsors.map((item) => (
                <View key={item.title} style={[styles.sponsorPill, isCompact && styles.sponsorPillCompact]}>
                  <MaterialIcons name={item.icon} size={24} color={item.color} />
                  <Text style={[styles.sponsorText, { color: item.color }]}>{item.title}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <SectionHeader title="VENUE" />
            <View style={styles.venueLocationRow}>
              <View style={styles.venueLocationCopy}>
                <MaterialIcons name="location-on" size={30} color={colors.primary} />
                <View style={styles.venueDetails}>
                  <Text style={styles.venueTitle}>{venueName}</Text>
                  <Text style={styles.venueSubtitle}>{venueAddress}</Text>
                  <Text style={styles.venueDate}>9-11 July, 2026</Text>
                </View>
              </View>

              {/* <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL(venueDirectionsUrl)}
                style={styles.mapButton}
              >
                <MaterialIcons name="navigation" size={34} color={colors.primary} />
              </TouchableOpacity> */}
            </View>

            <VenuePreview />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL(venueDirectionsUrl)}
              style={styles.directionChip}
            >
              <MaterialIcons name="navigation" size={16} color={colors.primary} />
              <Text style={styles.directionText}>Get Directions</Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.socialStack}>
            {socialLinks.map((item) => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.8}
                accessibilityLabel={item.title}
                onPress={() => Linking.openURL(item.url)}
                style={styles.socialButton}
              >
                {item.iconSet === "ionicons" ? (
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                ) : (
                  <FontAwesome name={item.icon} size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomTabs activeTab="home" onTabPress={handleTabPress} />
    </View>
  );
}

function FeaturedEventCard({ isCompact, onExploreEvent }) {
  return (
    <Card style={[styles.featuredCard, isCompact && styles.featuredCardCompact]}>
      {/* <View style={[styles.featuredCopy, isCompact && styles.featuredCopyCompact]}>
        <Text style={[styles.eyebrow, isCompact && styles.eyebrowCompact]}>
          {"Come Let's Celebrate"}
        </Text>
        <Text style={[styles.featuredTitle, isCompact && styles.featuredTitleCompact]}>
          Festival of
        </Text>
        <Text style={[styles.featuredAccent, isCompact && styles.featuredAccentCompact]}>
          TRANSPORTERS
        </Text>

        <View style={styles.modeRow}>
          {transportModes.map((item) => (
            <View key={item.title} style={styles.modeChip}>
              <MaterialIcons name={item.icon} size={17} color={item.color} />
              <Text style={[styles.modeText, { color: item.color }]}>{item.title}</Text>
            </View>
          ))}
        </View>

        
      </View> */}
      <Image
        source={festivalBanner}
        style={[styles.featuredBannerImage, isCompact && styles.featuredBannerImageCompact]}
        resizeMode="stretch"
      />

      <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={onExploreEvent}>
        <Text style={styles.primaryButtonText}>Explore Event</Text>
        <MaterialIcons name="arrow-forward" size={19} color={colors.white} />
      </TouchableOpacity>

      
      
    </Card>
  );
}

function SectionHeader({ title, compact = false }) {
  return <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>{title}</Text>;
}

function VenuePreview() {
  if (Platform.OS === "web") {
    return (
      <View style={styles.mapPreview}>
        {React.createElement("iframe", {
          src: venueEmbedUrl,
          title: venueQuery,
          loading: "lazy",
          referrerPolicy: "no-referrer-when-downgrade",
          style: {
            border: 0,
            width: "100%",
            height: "100%",
          },
        })}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Linking.openURL(venueMapsUrl)}
          style={styles.mapsOverlayButton}
        >
          <Text style={styles.mapsOverlayText}>Maps</Text>
          <MaterialIcons name="open-in-new" size={20} color="#2F6FED" />
        </TouchableOpacity>
      </View>
    );
  }

  if (venueStaticMapUrl) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => Linking.openURL(venueMapsUrl)}
        style={styles.mapPreview}
      >
        <Image source={{ uri: venueStaticMapUrl }} style={styles.mapPreviewImage} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => Linking.openURL(venueMapsUrl)}
      style={[styles.mapPreview, styles.mapPreviewFallback]}
    >
      <View style={styles.fallbackRoad} />
      <View style={[styles.fallbackRoad, styles.fallbackRoadAlt]} />
      <MaterialIcons name="location-pin" size={58} color={colors.primary} />
      <Text style={styles.fallbackMapText}>{venueName}</Text>
      <View style={styles.mapsOverlayButton}>
        <Text style={styles.mapsOverlayText}>Maps</Text>
        <MaterialIcons name="open-in-new" size={20} color="#2F6FED" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    paddingBottom: 22,
  },
  topSection: {
    width: "100%",
    backgroundColor: colors.topSection,
    paddingHorizontal: layout.topSectionHorizontalPadding,
    paddingBottom: 80,
  },
  heroInner: {
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: layout.topBarHorizontalMargin,
    gap: 12,
  },
  logo: {
    flex: 1,
    maxWidth: 310,
    height: 102,
    //tintColor: colors.white,
  },
  logoCompact: {
    maxWidth: 150,
    height: 74,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    width: 45,
    height: 45,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonCompact: {
    width: 35,
    height: 35,
    borderRadius: 14,
  },
  actionImage: {
    width: 28,
    height: 28,
    tintColor: colors.white,
  },
  badge: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F4511E",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  mainContent: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -60,
    gap: 12,
  },
  featuredCard: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFDF2",
    alignItems: "flex-start",
    padding: 0,
    paddingBottom: 14,
  },
  featuredCardCompact: {
    paddingBottom: 12,
  },
  featuredCopy: {
    flex: 1,
    maxWidth: "54%",
    zIndex: 1,
  },
  featuredCopyCompact: {
    maxWidth: "58%",
  },
  eyebrow: {
    color: colors.success,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  eyebrowCompact: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 5,
  },
  featuredTitle: {
    color: "#17171A",
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900",
  },
  featuredTitleCompact: {
    fontSize: 25,
    lineHeight: 30,
  },
  featuredAccent: {
    color: "#EF3216",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
  },
  featuredAccentCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  modeChip: {
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 2,
  },
  modeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  featuredBannerImage: {
    width: "100%",
    height: 220,
    alignSelf: "stretch",
    backgroundColor: "#FFFDF2",
  },
  featuredBannerImageCompact: {
    height: 150,
  },
  primaryButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    marginLeft: 18,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  card: {
    borderRadius: 22,
    backgroundColor: colors.white,
    padding: 20,
  },
  partnerCard: {
    //borderRadius: 22,
    //backgroundColor: colors.white,
    paddingHorizontal: 18,
    //paddingVertical: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 2,
  },
  partnerLogo: {
    width: "100%",
    height: 84,
  },
  cardHeading: {
    color: "#090A1F",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    marginBottom: 18,
  },
  highlightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  highlightItem: {
    width: "33.333%",
    minHeight: 98,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    paddingRight: 10,
  },
  highlightItemCompact: {
    width: "50%",
    gap: 10,
  },
  highlightIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightCopy: {
    flex: 1,
  },
  highlightValue: {
    color: "#090A1F",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
  },
  highlightLabel: {
    color: "#090A1F",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  sectionTitleCompact: {
    marginBottom: 0,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  aboutRowCompact: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  aboutCopy: {
    flex: 1,
  },
  eventTitle: {
    color: "#090A1F",
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "900",
    marginBottom: 14,
  },
  bodyText: {
    color: "#191B2F",
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "500",
  },
  aboutIllustration: {
    width: 220,
    height: 140,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EAF4FF",
  },
  aboutIllustrationCompact: {
    width: "100%",
    height: 150,
    borderRadius: 18,
  },
  aboutImage: {
    width: "100%",
    height: "100%",
  },
  readMoreButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  quickCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  quickCardCompact: {
    flexBasis: "47%",
  },
  quickTitle: {
    color: "#090A1F",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  exploreButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  exploreText: {
    color: colors.primary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sponsorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  sponsorPill: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9EBEF",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  sponsorPillCompact: {
    flexBasis: "47%",
  },
  sponsorText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  venueLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 14,
  },
  venueLocationCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  venueDetails: {
    flex: 1,
  },
  venueTitle: {
    color: "#090A1F",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  venueSubtitle: {
    color: "#5D6270",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  venueDate: {
    color: "#7B8190",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 1,
  },
  directionChip: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    marginTop: 12,
  },
  directionText: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 17,
    fontWeight: "900",
  },
  mapButton: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPreview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E8EAED",
  },
  mapPreviewImage: {
    width: "100%",
    height: "100%",
  },
  mapsOverlayButton: {
    position: "absolute",
    top: 14,
    left: 14,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  mapsOverlayText: {
    color: "#2F6FED",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  mapPreviewFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackRoad: {
    position: "absolute",
    width: "140%",
    height: 34,
    backgroundColor: "#C9CDD4",
    transform: [{ rotate: "-18deg" }],
  },
  fallbackRoadAlt: {
    width: "120%",
    height: 26,
    backgroundColor: "#D7DAE0",
    transform: [{ rotate: "28deg" }],
  },
  fallbackMapText: {
    color: "#4E5665",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    marginTop: -5,
  },
  socialStack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 6,
  },
  socialButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
