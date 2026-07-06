import React, { useEffect, useMemo, useRef, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppStatusBar from "../components/AppStatusBar";
import ActionButton from "../components/ActionButton";
import PartnerTitleBadge from "../components/PartnerTitleBadge";
import { colors } from "../constants/colors";
import { MOBILE_MAX_WIDTH } from "../constants/layout";
import { spacing } from "../constants/spacing";
import { useAppContentWidth } from "../hooks/useAppContentWidth";
import { fontFamily } from "../constants/typography";
import HomeScreenNewBottomTabs from "../navigation/HomeScreenNewBottomTabs";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { buildVenueLinks, DEFAULT_VENUE } from "../utils/eventHomeMapper";
import EventHubScreenNew from "./EventHubScreenNew";
import MyProfileScreen from "./MyProfileScreen";

const LOGO_ROW_GAP = spacing.sm;
const APP_LOGO_SHARE = 0.55;
const BOCI_LOGO_SHARE = 0.45;
const APP_LOGO_ASPECT = 192 / 59;
const BOCI_LOGO_ASPECT = 2.8;

/** Adjust these to change the blue gradient header height/spacing */
const HEADER_PADDING_TOP = 18;
const HEADER_PADDING_BOTTOM = 38;
const HEADER_INNER_GAP = 16;
const HEADER_INNER_MIN_HEIGHT = 220;
const HEADER_CARD_PADDING_VERTICAL = 14;
const QUICK_GRID_GAP = 8;
const QUICK_GRID_COLUMNS = 3;
const SPEAKER_CARD_WIDTH = 148;
const SPEAKER_CARD_GAP = 16;
const SPEAKER_PHOTO_HEIGHT = 108;
const SPEAKER_AUTO_SCROLL_MS = 3000;

const assets = {
  appLogo: require("../assets/splash-app-logo.png"),
  bociLogo: require("../assets/boci-light.png"),
  supportedBy: require("../assets/supportedbylogo.png"),
  eventInfo: require("../assets/event_info.png"),
  idCard: require("../assets/id_card.png"),
  myProfile: require("../assets/my_profile.png"),
  chat: require("../assets/chat.png"),
  exhibition: require("../assets/exhibition.png"),
  conference: require("../assets/conference.png"),
  awards: require("../assets/awards.png"),
  speakers: require("../assets/speakers.png"),
  b2b: require("../assets/b2b.png"),
  "floor-plan": require("../assets/floor-plan.png"),
  gallery: require("../assets/gallery.png"),
  boci: require("../assets/boci.png"),
  hub: require("../assets/hub.png"),
  partner1: require("../assets/partner1.png"),
  partner2: require("../assets/partner2.png"),
  partner3: require("../assets/partner3.png"),
  delegate: require("../assets/delegate.png"),
  stall: require("../assets/stall.png"),
};

const speakerPlaceholders = [
  require("../assets/speaker_placeholder.png"),
  require("../assets/speaker_profile.png"),
];

const DEFAULT_QUICK_ACCESS_ITEMS = [
  { id: "exhibition", title: "Exhibition", routeKey: "exhibition" },
  { id: "conference", title: "Conference", routeKey: "conference" },
  { id: "awards", title: "Awards", routeKey: "awards" },
  { id: "speakers", title: "Speakers", routeKey: "speakers" },
  { id: "b2b", title: "B2B Partnering", routeKey: "b2b" },
  { id: "floor-plan", title: "Floor Plan", routeKey: "floor-plan" },
  { id: "gallery", title: "Gallery", routeKey: "gallery" },
  { id: "boci", title: "BOCI", routeKey: "boci" },
  { id: "hub", title: "Explore More", routeKey: "hub" },
];

const QUICK_ACCESS_TINTED_KEYS = new Set(["awards"]);
const HIDDEN_QUICK_ACCESS_KEYS = new Set(["partners", "dignitaries"]);

function shouldHideQuickAccessItem(item) {
  const candidates = [item?.routeKey, item?.key, item?.id, item?.slug]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return candidates.some((value) => HIDDEN_QUICK_ACCESS_KEYS.has(value));
}

const registrationItems = [
  { title: "Delegate Registration", icon: assets.delegate },
  { title: "Book Your Stall", icon: assets.stall },
  { title: "Visitor Registration", icon: assets.idCard },
];

const partners = [
  { title: "Principal Partner", image: assets.partner1 },
  { title: "Awards Partner", image: assets.partner2 },
  { title: "Supporting Partner", image: assets.partner3 }
];

const fallbackSpeakers = [
  { id: "1", name: "Rajesh Kumar", role: "Director", company: "Volvo Buses India", placeholderIndex: 0 },
  { id: "2", name: "Priya Sharma", role: "Head of Operations", company: "Ashok Leyland", placeholderIndex: 1 },
  { id: "3", name: "Amit Patel", role: "Chief Technology Officer", company: "Tata Motors", placeholderIndex: 2 },
  { id: "4", name: "Sneha Reddy", role: "VP Mobility", company: "Eicher Motors", placeholderIndex: 0 },
  { id: "5", name: "Vikram Singh", role: "Managing Director", company: "JBM Auto", placeholderIndex: 1 },
];

const socialLinks = [
  { icon: "logo-x", iconSet: "ionicons", url: "https://x.com/" },
  { icon: "linkedin", iconSet: "fontawesome", url: "https://www.linkedin.com/" },
  { icon: "instagram", iconSet: "fontawesome", url: "https://www.instagram.com/" },
  { icon: "facebook", iconSet: "fontawesome", url: "https://www.facebook.com/" },
  { icon: "youtube-play", iconSet: "fontawesome", url: "https://www.youtube.com/" },
];

const defaultVenue = buildVenueLinks();

const DEFAULT_EVENT_DATES = "9-11 July, 2026";
const SOCIAL_GRADIENT = [colors.brandBlue, colors.accentBlue];

export default function HomeScreenNew({
  user,
  homeContent = null,
  initialTab = "home",
  onOpenSpeakers,
  onOpenDignitaries,
  onOpenExhibition,
  onOpenEventInfo,
  onOpenContactUs,
  onOpenEventJourney,
  onOpenAwards,
  onOpenB2BPartnering,
  onOpenFloorPlan,
  onOpenBociPartner,
  onOpenGallery,
  onOpenMyBadge,
  onOpenBadgeScanner,
  onOpenNotifications,
  onOpenMessages,
  onOpenPartners,
  onOpenConference,
  hasUnreadNotifications = false,
  hasUnreadMessages = false,
  onDeleteAccount,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const eventDates = homeContent?.eventDates || DEFAULT_EVENT_DATES;
  const venue = homeContent?.venue || defaultVenue;
  const displaySpeakers =
    homeContent?.speakers?.length > 0 ? homeContent.speakers : fallbackSpeakers;
  const displayDignitaries = homeContent?.dignitaries || [];
  const displayPartners =
    homeContent?.partners?.length > 0 ? homeContent.partners : partners;
  const displaySocialLinks =
    homeContent?.socialLinks?.length > 0 ? homeContent.socialLinks : socialLinks;
  const displayQuickAccessItems = useMemo(() => {
    const fromApi = homeContent?.quickAccessItems || [];
    const items = fromApi.length > 0 ? fromApi : DEFAULT_QUICK_ACCESS_ITEMS;
    return items.filter((item) => !shouldHideQuickAccessItem(item));
  }, [homeContent?.quickAccessItems]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const contentWidth = useAppContentWidth(12);
  const rowInnerWidth = contentWidth - LOGO_ROW_GAP;
  const appLogoWidth = rowInnerWidth * APP_LOGO_SHARE;
  const appLogoHeight = appLogoWidth / APP_LOGO_ASPECT;
  const bociLogoWidth = rowInnerWidth * BOCI_LOGO_SHARE;
  const bociLogoHeight = bociLogoWidth / BOCI_LOGO_ASPECT;
  const quickGridWidth = Math.min(contentWidth - 32, MOBILE_MAX_WIDTH - 44);
  const quickCardWidth =
    (quickGridWidth - QUICK_GRID_GAP * (QUICK_GRID_COLUMNS - 1)) / QUICK_GRID_COLUMNS;

  const handleQuickAccess = (routeKey) => {
    switch (routeKey) {
      case "conference":
        onOpenConference?.();
        break;
      case "speakers":
        onOpenSpeakers?.();
        break;
      case "exhibition":
        onOpenExhibition?.();
        break;
      case "awards":
        onOpenAwards?.();
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
      case "hub":
        setActiveTab("hub");
        break;
      default:
        break;
    }
  };

  const handleTabPress = (tab) => {
    if (tab === "exhibition") {
      onOpenExhibition?.();
      return;
    }
    setActiveTab(tab);
  };

  if (activeTab === "hub") {
    return (
      <View style={styles.screen}>
        <EventHubScreenNew
          onBack={() => setActiveTab("home")}
          onOpenBadgeScanner={onOpenBadgeScanner}
          onOpenExhibition={onOpenExhibition}
          onOpenConference={onOpenConference}
          onOpenAwards={onOpenAwards}
          onOpenSpeakers={onOpenSpeakers}
          onOpenB2BPartnering={onOpenB2BPartnering}
          onOpenFloorPlan={onOpenFloorPlan}
          onOpenBociPartner={onOpenBociPartner}
          onOpenGallery={onOpenGallery}
        />
        <HomeScreenNewBottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  if (activeTab === "profile") {
    return (
      <View style={styles.screen}>
        <MyProfileScreen user={user} onDeleteAccount={onDeleteAccount} onLogout={onLogout} />
        <HomeScreenNewBottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={["#000000", "#0066D8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.header,
            { paddingTop: HEADER_PADDING_TOP, paddingBottom: HEADER_PADDING_BOTTOM },
          ]}
        >
          <View
            style={[
              styles.headerInner,
              {
                width: contentWidth,
                gap: HEADER_INNER_GAP,
                minHeight: HEADER_INNER_MIN_HEIGHT || undefined,
              },
            ]}
          >
            <View style={styles.logoRow}>
              <Image
                source={assets.appLogo}
                style={{ width: appLogoWidth, height: appLogoHeight }}
                resizeMode="contain"
              />
              <Image
                source={assets.bociLogo}
                style={{ width: bociLogoWidth, height: bociLogoHeight }}
                resizeMode="contain"
              />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaLeft}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.white} />
                  <Text style={styles.metaText}>{eventDates}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={16} color={colors.white} />
                  <Text style={styles.metaText}>{venue.address || DEFAULT_VENUE.address}</Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerActionBtn}
                  activeOpacity={0.8}
                  onPress={() => onOpenNotifications?.()}
                >
                  <Ionicons name="notifications-outline" size={22} color={colors.white} />
                  {hasUnreadNotifications ? <View style={styles.statusDot} /> : null}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerActionBtn}
                  activeOpacity={0.8}
                  onPress={() => onOpenMessages?.()}
                >
                  <MaterialIcons name="chat-bubble-outline" size={22} color={colors.white} />
                  {hasUnreadMessages ? <View style={styles.statusDot} /> : null}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerCardsRow}>
              {[
                {
                  label: "Event Info",
                  icon: assets.eventInfo,
                  onPress: () => onOpenEventInfo?.(),
                },
                {
                  label: "My Badge",
                  icon: assets.idCard,
                  onPress: () => onOpenMyBadge?.(),
                },
                {
                  label: "My Profile",
                  icon: assets.myProfile,
                  onPress: () => setActiveTab("profile"),
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.85}
                  onPress={item.onPress}
                  style={styles.headerCard}
                >
                  <Image source={item.icon} style={styles.headerCardIcon} resizeMode="contain" />
                  <Text style={styles.headerCardText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.body, { width: contentWidth }]}>
          <View style={styles.supportedByCard}>
            <Image
              source={assets.supportedBy}
              style={styles.supportedByImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={[styles.quickGrid, { width: quickGridWidth }]}>
            {displayQuickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id || item.routeKey}
                activeOpacity={0.85}
                onPress={() => handleQuickAccess(item.routeKey)}
                style={[styles.quickCard, { width: quickCardWidth }]}
              >
                <Image
                  source={getQuickAccessIconSource(item)}
                  style={getQuickAccessIconStyle(item)}
                  resizeMode="contain"
                />
                <Text style={styles.quickCardText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {displayDignitaries.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Dignitaries</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenDignitaries?.()}>
                  <Text style={styles.viewMoreText}>View More</Text>
                </TouchableOpacity>
              </View>

              <SpeakersCarousel
                speakers={displayDignitaries}
                onPressSpeaker={() => onOpenDignitaries?.()}
              />
            </>
          ) : null}

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Speakers</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenSpeakers?.()}>
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>

          <SpeakersCarousel
            speakers={displaySpeakers}
            onPressSpeaker={(speaker) => onOpenSpeakers?.()}
          />

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Partners</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenPartners?.()}>
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          </View>

          

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnersRow}>
            {displayPartners.map((partner, index) => (
              <View key={partner.id || partner.title || index} style={styles.partnerCard}>
                <View style={styles.partnerLogoWrap}>
                  <Image
                    source={getPartnerImageSource(partner, index)}
                    style={styles.partnerImage}
                    resizeMode="contain"
                  />
                </View>
                <PartnerTitleBadge title={partner.title} placement="bottom" />
              </View>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Venue</Text>
          <View style={styles.venueCard}>
            <View style={styles.venueLocationRow}>
              <View style={styles.venueLocationCopy}>
                <MaterialIcons name="location-on" size={30} color={colors.primaryBlue} />
                <View style={styles.venueDetails}>
                  <Text style={styles.venueName}>{venue.name || DEFAULT_VENUE.name}</Text>
                  <Text style={styles.venueSubtitle}>{venue.address || DEFAULT_VENUE.address}</Text>

                </View>
              </View>
            </View>

            <VenuePreview venue={venue} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Linking.openURL(venue.directionsUrl)}
              style={styles.directionChip}
            >
              <MaterialIcons name="navigation" size={16} color={colors.primaryBlue} />
              <Text style={styles.directionText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onOpenEventJourney?.()}
            style={styles.eventJourneyButton}
          >
            <Text style={styles.eventJourneyButtonText}>View Personal Event Journey</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Social Media</Text>
          <LinearGradient
            colors={SOCIAL_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.socialBar}
          >
            {displaySocialLinks.map((item, index) => (
              <TouchableOpacity
                key={item.id || item.icon || index}
                activeOpacity={0.85}
                onPress={() => Linking.openURL(item.url)}
                style={styles.socialButton}
              >
                {item.iconSet === "ionicons" ? (
                  <Ionicons name={item.icon} size={18} color="#FFFFFF" />
                ) : (
                  <FontAwesome name={item.icon} size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </LinearGradient>

          <View style={styles.contactBlock}>
            <ActionButton
              title="Contact Us"
              variant="compact"
              color="neutral"
              onPress={() => onOpenContactUs?.()}
            />
          </View>
        </View>
      </ScrollView>

      <HomeScreenNewBottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

function SpeakersCarousel({ speakers, onPressSpeaker }) {
  const scrollRef = useRef(null);
  const activeIndexRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    if (speakers.length <= 1) return undefined;

    const interval = setInterval(() => {
      if (isUserScrollingRef.current) return;

      activeIndexRef.current = (activeIndexRef.current + 1) % speakers.length;
      scrollRef.current?.scrollTo({
        x: activeIndexRef.current * (SPEAKER_CARD_WIDTH + SPEAKER_CARD_GAP),
        animated: true,
      });
    }, SPEAKER_AUTO_SCROLL_MS);

    return () => clearInterval(interval);
  }, [speakers.length]);

  if (speakers.length === 0) return null;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={SPEAKER_CARD_WIDTH + SPEAKER_CARD_GAP}
      snapToAlignment="start"
      contentContainerStyle={styles.speakersRow}
      onScrollBeginDrag={() => {
        isUserScrollingRef.current = true;
      }}
      onMomentumScrollEnd={(event) => {
        isUserScrollingRef.current = false;
        const offsetX = event.nativeEvent.contentOffset.x;
        activeIndexRef.current = Math.round(
          offsetX / (SPEAKER_CARD_WIDTH + SPEAKER_CARD_GAP)
        );
      }}
    >
      {speakers.map((speaker, index) => (
        <TouchableOpacity
          key={speaker.id}
          activeOpacity={0.85}
          onPress={() => onPressSpeaker?.(speaker)}
          style={styles.speakerCarouselItem}
        >
          <Image
            source={getSpeakerCarouselImage(speaker, index)}
            style={styles.speakerPhoto}
            resizeMode="cover"
          />
          <View style={styles.speakerDetails}>
            <Text style={styles.speakerName} numberOfLines={2}>
              {speaker.name}
            </Text>
            {!!speaker.role && (
              <Text style={styles.speakerMeta} numberOfLines={1}>
                {speaker.role}
              </Text>
            )}
            {!!speaker.company && (
              <Text style={styles.speakerMeta} numberOfLines={1}>
                {speaker.company}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function resolveQuickAccessAssetKey(routeKey) {
  if (!routeKey) {
    return null;
  }

  const normalized = String(routeKey).toLowerCase().trim();

  if (assets[normalized]) {
    return normalized;
  }

  const compact = normalized.replace(/-/g, "");
  if (assets[compact]) {
    return compact;
  }

  return null;
}

function getQuickAccessIconSource(item) {
  if (item.imageUrl) {
    return { uri: item.imageUrl };
  }

  const assetKey = resolveQuickAccessAssetKey(item.routeKey);
  return assetKey ? assets[assetKey] : assets.hub;
}

function getQuickAccessIconStyle(item) {
  if (QUICK_ACCESS_TINTED_KEYS.has(item.routeKey)) {
    return [styles.quickAccessIcon, styles.quickAccessIconTinted];
  }

  return styles.quickAccessIcon;
}

function getRemoteImageSource(url) {
  const resolved = resolveMediaUrl(url);
  return resolved ? { uri: resolved } : null;
}

function getPartnerImageSource(partner, index) {
  const remoteSource = getRemoteImageSource(partner.imageUrl || partner.logoUrl);
  if (remoteSource) {
    return remoteSource;
  }

  if (partner.image) {
    return partner.image;
  }

  const fallbackImages = [assets.partner1, assets.partner2, assets.partner3];
  return fallbackImages[index % fallbackImages.length];
}

function getSpeakerCarouselImage(speaker, index) {
  const remoteSource = getRemoteImageSource(speaker.imageUrl);
  if (remoteSource) {
    return remoteSource;
  }

  const placeholderIndex =
    typeof speaker.placeholderIndex === "number" ? speaker.placeholderIndex : index;

  return speakerPlaceholders[placeholderIndex % speakerPlaceholders.length];
}

function VenuePreview({ venue }) {
  const venueQuery = venue?.query || defaultVenue.query;
  const venueMapsUrl = venue?.mapsUrl || defaultVenue.mapsUrl;
  const venueEmbedUrl = venue?.embedUrl || defaultVenue.embedUrl;
  const venueStaticMapUrl = venue?.staticMapUrl || defaultVenue.staticMapUrl;
  const displayVenueName = venue?.name || DEFAULT_VENUE.name;

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
      <MaterialIcons name="location-pin" size={58} color={colors.primaryBlue} />
      <Text style={styles.fallbackMapText}>{displayVenueName}</Text>
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
    backgroundColor: "#F3F4F8",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  headerInner: {
    alignSelf: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: LOGO_ROW_GAP,
  },
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  metaLeft: {
    flex: 1,
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#FFFFFF",
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionIcon: {
    width: 22,
    height: 22,
  },
  statusDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
  },
  headerCardsRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 10,
  },
  headerCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: HEADER_CARD_PADDING_VERTICAL,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  headerCardIcon: {
    width: 22,
    height: 22,
  },
  headerCardText: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    alignSelf: "center",
    paddingHorizontal: 10,
    gap: 18,
    marginTop: Platform.select({ web: -38, default: -20 }),
  },
  supportedByCard: {
    backgroundColor: colors.supportedByBlue,
    borderRadius: 16,
    padding: 30,
    marginTop: Platform.select({ web: 0, default: -20 }),
  },
  supportedByImage: {
    width: "100%",
    height: 72,
  },
  eventJourneyButton: {
    backgroundColor: colors.supportedByBlue,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  eventJourneyButtonText: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  viewMoreText: {
    color: "#575555",
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 24,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: QUICK_GRID_GAP,
    alignSelf: "center",
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 96,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickCardText: {
    color: colors.brandBlue,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  quickAccessIcon: {
    width: 28,
    height: 28,
  },
  quickAccessIconTinted: {
    tintColor: colors.brandBlue,
  },
  speakersRow: {
    paddingRight: spacing.sm + 4,
    gap: SPEAKER_CARD_GAP,
  },
  speakerCarouselItem: {
    width: SPEAKER_CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  speakerPhoto: {
    width: "100%",
    height: SPEAKER_PHOTO_HEIGHT,
    backgroundColor: colors.borderInput,
  },
  speakerDetails: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 4,
    alignItems: "center",
  },
  speakerName: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
  speakerMeta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  partnersRow: {
    gap: 12,
    paddingRight: 8,
    paddingBottom: 14,
  },
  partnerCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: 14,
    position: "relative",
    overflow: "visible",
    paddingBottom: 20,
  },
  partnerLogoWrap: {
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm,
  },
  partnerImage: {
    width: "100%",
    height: "100%",
  },
  registrationBlock: {
    gap: 12,
    marginTop: 15,
  },
  registrationButtonWrap: {
    width: "100%",
  },
  registrationButton: {
    minHeight: 74,
    borderRadius: 5,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  registrationIcon: {
    width: 22,
    height: 22,
    tintColor: "#FFFFFF",
  },
  registrationText: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  venueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 4,
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
  venueName: {
    color: "#090A1F",
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 25,
  },
  venueSubtitle: {
    color: "#5D6270",
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  venueDate: {
    color: "#7B8190",
    fontFamily: fontFamily.bold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  directionChip: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f1",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    marginTop: 12,
  },
  directionText: {
    color: colors.black,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 17,
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
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 24,
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
    fontFamily: fontFamily.bold,
    fontSize: 17,
    lineHeight: 22,
    marginTop: -5,
  },
  socialBar: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  contactBlock: {
    alignItems: "center",
   // gap: 10,
  },
});
