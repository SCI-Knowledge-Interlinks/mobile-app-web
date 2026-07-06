import React, { useMemo } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";
import { mapEventHomeResponse } from "../utils/eventHomeMapper";

const bannerImage = require("../assets/banner1.jpg");

const fallbackSocialLinks = [
  { icon: "logo-x", iconSet: "ionicons", url: "https://x.com/" },
  { icon: "linkedin", iconSet: "fontawesome", url: "https://www.linkedin.com/" },
  { icon: "instagram", iconSet: "fontawesome", url: "https://www.instagram.com/" },
  { icon: "facebook", iconSet: "fontawesome", url: "https://www.facebook.com/" },
  { icon: "youtube-play", iconSet: "fontawesome", url: "https://www.youtube.com/" },
];

const DEFAULT_BODY =
  "Prawaas 5.0 aims to bring stakeholders together to expand services, modernise infrastructure, and enable inclusive access through a truly multimodal approach integrating buses, metro, taxis, and last-mile solutions.";

export default function EventInfoScreen({ content = null, isLoading = false, onBack }) {
  const insets = useSafeAreaInsets();
  const mapped = useMemo(() => {
    if (!content) {
      return null;
    }

    return mapEventHomeResponse({
      ...content,
      socialLinks: content.socialLinks,
    });
  }, [content]);

  const socialLinks = mapped?.socialLinks?.length ? mapped.socialLinks : fallbackSocialLinks;

  const bannerSlides = useMemo(() => {
    const banners = content?.bannerImages?.length ? content.bannerImages : [];

    if (banners.length > 0) {
      return banners.map((banner) => ({
        key: banner.id || banner.imageUrl,
        image: { uri: banner.imageUrl },
      }));
    }

    if (content?.bannerUrl) {
      return [{ key: "banner", image: { uri: content.bannerUrl } }];
    }

    return [{ key: "fallback", image: bannerImage }];
  }, [content?.bannerImages, content?.bannerUrl]);

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="About Event" onBack={onBack} />
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPadding(insets) },
          ]}
        >
          <View style={styles.bannerWrap}>
            <InfoDetailCard
              variant="banner"
              bannerSlides={bannerSlides}
              bannerImageResizeMode="contain"
              bannerInfoSectionStyle={styles.bannerInfoSection}
              heading={content?.heading || content?.title || "About Event"}
              headingCentered
              body={content?.body || DEFAULT_BODY}
              footer={
                <>
                  <Text style={styles.socialTitle}>Social Media</Text>
                  <View style={styles.socialRow}>
                    {socialLinks.map((item) => (
                      <TouchableOpacity
                        key={item.id || item.icon}
                        activeOpacity={0.85}
                        onPress={() => item.url && Linking.openURL(item.url)}
                        style={styles.socialIconWrap}
                      >
                        {item.iconSet === "ionicons" ? (
                          <Ionicons name={item.icon} size={18} color={colors.white} />
                        ) : (
                          <FontAwesome name={item.icon} size={18} color={colors.white} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              }
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
  },
  bannerWrap: {
    ...commonStyles.bannerWrap,
    paddingTop: 0,
    marginTop: 0,
  },
  bannerInfoSection: {
    paddingTop: 0,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  socialTitle: {
    ...textPresets.sectionTitle,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  socialIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
});
