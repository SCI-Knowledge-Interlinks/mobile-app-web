import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ListSearchBar from "../components/ListSearchBar";
import PartnerTitleBadge from "../components/PartnerTitleBadge";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { useTwoColumnCardWidth } from "../hooks/useAppContentWidth";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const GRID_GAP = spacing.sm + 2;
const GRID_PADDING = spacing.md;

const assets = {
  tata: require("../assets/partner1.png"),
  redbus: require("../assets/partner_redbus.png"),
  volvo: require("../assets/partner_volvo.png"),
  eicher: require("../assets/partner_eicher.png"),
};

const allPartners = [
  { id: "1", title: "Principal Partner", logoKey: "tata" },
  { id: "2", title: "Awards Partner", logoKey: "redbus" },
  { id: "3", title: "Awards Partner", logoKey: "redbus" },
  { id: "4", title: "Awards Partner", logoKey: "redbus" },
  { id: "5", title: "Conference Co-Host", label: "abhibus" },
  { id: "6", title: "BOCI Day Partner", logoKey: "volvo" },
  { id: "7", title: "BOCI Day Partner", logoKey: "volvo" },
  { id: "8", title: "BOCI Day Partner", logoKey: "volvo" },
  { id: "9", title: "BOCI Day Partner", logoKey: "eicher" },
  { id: "10", title: "BOCI Day Partner", logoKey: "eicher" },
];

export default function PartnersScreenNew({
  partners: partnersProp,
  isLoading = false,
  onBack,
  onOpenPartnerInfo,
}) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const { contentWidth, cardWidth } = useTwoColumnCardWidth(GRID_PADDING, GRID_GAP);
  const sourcePartners = partnersProp?.length ? partnersProp : allPartners;

  const visiblePartners = useMemo(
    () => sourcePartners.filter((partner) => matchesPartnerSearch(partner, searchText)),
    [searchText, sourcePartners]
  );

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="All Partners" onBack={onBack} />
      <ListSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by partner name or category"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.brandBlue} />
          </View>
        ) : visiblePartners.length === 0 ? (
          <Text style={commonStyles.emptyState}>
            {searchText.trim() ? "No partners match your search." : "No partners found."}
          </Text>
        ) : (
          <View style={[styles.grid, { width: contentWidth }]}>
            {visiblePartners.map((partner) => (
              <View key={partner.id} style={[styles.card, { width: cardWidth }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    onOpenPartnerInfo?.({
                      partner: {
                        id: partner.id,
                        title: partner.title,
                        label: partner.label || "",
                        logo: partner.logoUrl || partner.logo || "",
                        logoKey: partner.logoKey || null,
                        logoUrl: partner.logoUrl || "",
                        description: partner.description || "",
                      },
                    })
                  }
                  style={styles.cardPressable}
                >
                  <View style={styles.logoWrap}>
                    {partner.logoUrl ? (
                      <Image
                        source={{ uri: partner.logoUrl }}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    ) : partner.logoKey ? (
                      <Image
                        source={assets[partner.logoKey]}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.logoText}>{partner.label}</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <PartnerTitleBadge title={partner.title} placement="bottom" />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function matchesPartnerSearch(partner, searchText) {
  const query = searchText.trim().toLowerCase();
  if (!query) return true;

  return [partner.title, partner.label].filter(Boolean).join(" ").toLowerCase().includes(query);
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    paddingBottom: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    position: "relative",
    overflow: "visible",
    paddingBottom: 20,
    marginBottom: 14,
    ...commonStyles.cardShadow,
  },
  cardPressable: {
    borderRadius: 14,
  },
  logoWrap: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoText: {
    fontFamily: textPresets.infoHeading.fontFamily,
    fontSize: 28,
    color: colors.partnerMaroon,
    textTransform: "lowercase",
  },
});
