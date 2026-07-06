import React, { useMemo, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import ScreenPageHeader from "../components/ScreenPageHeader";
import { useTwoColumnCardWidth } from "../hooks/useAppContentWidth";
import HomeScreenNewBottomTabs from "../navigation/HomeScreenNewBottomTabs";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const GRID_GAP = spacing.sm + 2;
const GRID_PADDING = spacing.md;

const assets = {
  partner1: require("../assets/partner1.png"),
  boci: require("../assets/boci-dark.png"),
};

const exhibitors = [
  { id: "1", name: "Abhibus", booth: "323", hall: "1" },
  { id: "2", name: "Abhibus", booth: "323", hall: "1" },
  { id: "3", name: "Abhibus", booth: "323", hall: "1" },
  { id: "4", name: "Abhibus", booth: "323", hall: "1" },
  { id: "5", name: "Abhibus", booth: "323", hall: "1" },
  { id: "6", name: "Abhibus", booth: "323", hall: "1" },
  { id: "7", name: "Abhibus", booth: "323", hall: "1" },
  { id: "8", name: "Abhibus", booth: "323", hall: "1" },
  { id: "9", name: "BOCI", booth: "D-15", hall: "10", logoKey: "boci" },
  { id: "10", name: "Principal Partner", booth: "A-12", hall: "10", logoKey: "partner1" },
];

export default function ExhibitorScreenNew({
  exhibitors: exhibitorsProp,
  isLoading = false,
  onBack,
  onTabPress,
  onOpenExhibitorInfo,
  activeTab = "exhibition",
}) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const { contentWidth, cardWidth } = useTwoColumnCardWidth(GRID_PADDING, GRID_GAP);
  const sourceExhibitors = Array.isArray(exhibitorsProp) ? exhibitorsProp : exhibitors;

  const visibleExhibitors = useMemo(
    () => sourceExhibitors.filter((item) => matchesExhibitorSearch(item, searchText)),
    [searchText, sourceExhibitors]
  );

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Exhibitors" onBack={onBack} />
      <ListSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name, booth or hall"
      />
      <Text style={styles.countLabel}>Total Count({visibleExhibitors.length})</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.brandBlue} />
          </View>
        ) : visibleExhibitors.length === 0 ? (
          <Text style={commonStyles.emptyState}>
            {searchText.trim() ? "No exhibitors match your search." : "No exhibitors found."}
          </Text>
        ) : (
        <View style={[styles.grid, { width: contentWidth }]}>
          {visibleExhibitors.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() =>
                onOpenExhibitorInfo?.({
                  exhibitor: {
                    id: item.id,
                    name: item.name,
                    booth: item.booth,
                    hall: item.hall,
                    logoKey: item.logoKey || null,
                    logoUrl: item.logoUrl || "",
                    description: item.description || item.title || "",
                  },
                })
              }
              style={[styles.card, { width: cardWidth }]}
            >
              <View style={styles.cardBody}>
                <ExhibitorLogo item={item} />
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.meta}>Booth No. {item.booth}</Text>
                <Text style={styles.meta}>Hall No. {item.hall}</Text>
              </View>
              <View style={styles.arrowButton}>
                <MaterialIcons name="arrow-forward" size={18} color={colors.brandBlue} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}
      </ScrollView>

      <HomeScreenNewBottomTabs activeTab={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

function matchesExhibitorSearch(item, searchText) {
  const query = searchText.trim().toLowerCase();
  if (!query) return true;

  return [item.name, item.booth, item.hall, `booth ${item.booth}`, `hall ${item.hall}`]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function ExhibitorLogo({ item }) {
  if (item.logoUrl) {
    return <Image source={{ uri: item.logoUrl }} style={styles.logoImage} resizeMode="contain" />;
  }

  const logo = item.logoKey ? assets[item.logoKey] || assets.boci : null;

  if (logo) {
    return <Image source={logo} style={styles.logoImage} resizeMode="contain" />;
  }

  return <Text style={styles.logoText}>abhibus</Text>;
}

const styles = StyleSheet.create({
  countLabel: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
    paddingHorizontal: 14,
    marginTop: 15,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.xs,
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.sm + 4,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm + 2,
    alignItems: "center",
    ...commonStyles.cardShadow,
    minHeight: 188,
    justifyContent: "space-between",
  },
  cardBody: {
    width: "100%",
    alignItems: "center",
    flexGrow: 1,
  },
  logoImage: {
    width: 88,
    height: 44,
    marginBottom: spacing.sm + 2,
  },
  logoText: {
    fontFamily: textPresets.infoHeading.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    color: colors.partnerMaroon,
    marginBottom: spacing.sm + 2,
    textTransform: "lowercase",
  },
  name: {
    ...textPresets.bodyMedium,
    fontFamily: textPresets.pageHeaderTitle.fontFamily,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  meta: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    color: colors.textSecondary,
    textAlign: "center",
  },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: spacing.sm,
  },
});
