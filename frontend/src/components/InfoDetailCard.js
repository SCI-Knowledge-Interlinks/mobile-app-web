import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import InfoCarousel from "./InfoCarousel";
import PartnerTitleBadge from "./PartnerTitleBadge";

/**
 * Shared info card — supports three layouts:
 * - detail (default): white top + optional badge + navy info section
 * - banner: full-width image + attached navy info section
 * - gallery: image card with navy footer title
 */
export default function InfoDetailCard({
  variant = "detail",
  topContent,
  badge,
  heading,
  body,
  bannerSource,
  bannerSlides,
  bannerAutoScroll = true,
  bannerImageResizeMode = "cover",
  bannerHeight = 220,
  bannerInfoSectionStyle,
  footer,
  headingCentered = false,
  galleryImageSource,
  galleryTitle,
  style,
}) {
  if (variant === "banner") {
    const slides = bannerSlides?.length
      ? bannerSlides
      : bannerSource
        ? [{ key: "banner", image: bannerSource }]
        : [];

    const alignBannerBottom = bannerImageResizeMode === "contain";

    return (
      <View style={[styles.bannerCard, style]}>
        {slides.length > 0 ? (
          slides.length > 1 ? (
            <InfoCarousel
              slides={slides}
              height={bannerHeight}
              variant="banner"
              imageResizeMode={bannerImageResizeMode}
              slideContentAlign={alignBannerBottom ? "bottom" : "center"}
              autoScroll={bannerAutoScroll}
              style={styles.bannerCarousel}
            />
          ) : (
            <View
              style={[
                styles.bannerImageWrap,
                alignBannerBottom && styles.bannerImageWrapBottom,
                { height: bannerHeight },
              ]}
            >
              <Image
                source={slides[0].image}
                style={styles.bannerImage}
                resizeMode={bannerImageResizeMode}
              />
            </View>
          )
        ) : null}
        <View style={[styles.bannerInfoSection, bannerInfoSectionStyle]}>
          {heading ? (
            <Text
              style={[
                styles.bannerHeading,
                headingCentered && styles.bannerHeadingCentered,
              ]}
            >
              {heading}
            </Text>
          ) : null}
          {body ? <Text style={styles.infoBody}>{body}</Text> : null}
          {footer}
        </View>
      </View>
    );
  }

  if (variant === "gallery") {
    return (
      <View style={[styles.galleryCard, style]}>
        <Image
          source={galleryImageSource}
          style={styles.galleryImage}
          resizeMode="cover"
        />
        <View style={styles.galleryFooter}>
          <Text style={styles.galleryTitle}>{galleryTitle}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topSection}>{topContent}</View>

      {badge ? (
        <PartnerTitleBadge title={badge} backgroundColor={colors.partnerInfoBadge} />
      ) : null}

      <View style={[styles.infoSection, !badge && styles.infoSectionNoBadge]}>
        {heading ? <Text style={styles.detailHeading}>{heading}</Text> : null}
        {body ? <Text style={styles.infoBody}>{body}</Text> : null}
        {footer}
      </View>
    </View>
  );
}

export function InfoLogoImage({ source, style }) {
  return <Image source={source} style={[styles.logoImage, style]} resizeMode="contain" />;
}

export function InfoLogoText({ children }) {
  return <Text style={styles.logoText}>{children}</Text>;
}

export function InfoOutlineButton({ children, onPress, activeOpacity = 0.85 }) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={styles.outlineButton}
    >
      <Text style={styles.outlineButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  topSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg + 4,
    alignItems: "center",
  },
  infoSection: {
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.lg + 4,
    paddingBottom: spacing.lg + 4,
    gap: spacing.sm + 4,
  },
  infoSectionNoBadge: {
    paddingTop: spacing.lg,
  },
  detailHeading: {
    ...textPresets.infoHeadingSmall,
    color: colors.white,
    textTransform: "uppercase",
  },
  infoBody: {
    ...textPresets.infoBody,
    color: colors.white,
    textAlign: "justify",
  },
  bannerCard: {
    width: "100%",
    overflow: "hidden",
  },
  bannerCarousel: {
    alignSelf: "stretch",
    marginTop: 0,
  },
  bannerImageWrap: {
    width: "100%",
    backgroundColor: colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImageWrapBottom: {
    justifyContent: "flex-end",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerInfoSection: {
    width: "100%",
    backgroundColor: colors.brandBlue,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg + 4,
    gap: spacing.md + 2,
  },
  bannerHeading: {
    ...textPresets.infoHeading,
    color: colors.white,
  },
  bannerHeadingCentered: {
    textAlign: "center",
  },
  galleryCard: {
    backgroundColor: colors.brandBlue,
    borderRadius: 14,
    overflow: "hidden",
    marginHorizontal: spacing.md,
  },
  galleryImage: {
    width: "100%",
    height: 200,
    alignSelf: "stretch",
    ...Platform.select({
      web: {
        objectFit: "cover",
        objectPosition: "top center",
      },
    }),
  },
  galleryFooter: {
    backgroundColor: colors.brandBlue,
    minHeight: 50,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryTitle: {
    ...textPresets.galleryCardTitle,
    color: colors.white,
    textAlign: "center",
  },
  logoImage: {
    width: 160,
    height: 56,
    marginBottom: spacing.sm + 2,
  },
  logoText: {
    fontFamily: textPresets.infoHeading.fontFamily,
    fontSize: 32,
    color: colors.partnerMaroon,
    textTransform: "lowercase",
    marginBottom: spacing.sm + 2,
  },
  outlineButton: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  outlineButtonText: {
    ...textPresets.outlineButton,
    color: colors.white,
  },
});
