import React, { useEffect, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Header } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

const tabs = ["Partners", "Exhibitors", "Startup"];

const exhibitionData = {
  Partners: {
    items: [
      { id: "partner-1", name: "Tata Motors", role: "Automotive Partner", business: "Automotive", booth: "P01", hall: "1", icon: "directions-bus", color: "#245BB2", accent: "#E65539" },
      { id: "partner-2", name: "Wipro", role: "Technology Partner", business: "Technology", booth: "P08", hall: "1", icon: "hub", color: "#21146B", accent: "#2F9E57", recommended: true },
      { id: "partner-3", name: "Google Cloud", role: "Cloud Partner", business: "Cloud", booth: "P14", hall: "2", icon: "cloud", color: "#4285F4", accent: "#F4B400", recommended: true },
      { id: "partner-4", name: "State Bank of India", role: "Banking Partner", business: "Finance", booth: "P22", hall: "2", icon: "account-balance", color: "#1D2B8F", accent: "#00A9E0" },
      { id: "partner-5", name: "Mahindra Electric", role: "EV Partner", business: "EV Infrastructure", booth: "P31", hall: "3", icon: "electric-car", color: "#D71920", accent: "#2F9E57", recommended: true },
      { id: "partner-6", name: "Ashok Leyland", role: "Commercial Mobility", business: "Automotive", booth: "P36", hall: "3", icon: "local-shipping", color: "#153F7A", accent: "#F4B400" },
      { id: "partner-7", name: "Jio Platforms", role: "Digital Partner", business: "Technology", booth: "P42", hall: "4", icon: "cell-tower", color: "#154FA3", accent: "#E65539" },
      { id: "partner-8", name: "Axis Bank", role: "Finance Partner", business: "Finance", booth: "P49", hall: "4", icon: "payments", color: "#97144D", accent: "#F4511E" },
    ],
  },
  Exhibitors: {
    items: [
      { id: "exhibitor-1", name: "6D Technologies", role: "Digital Solutions", business: "Technology", booth: "B11", hall: "1", icon: "donut-large", color: "#1893D1", accent: "#F4B400" },
      { id: "exhibitor-2", name: "Airconnect Infosystems", role: "Connectivity", business: "Connectivity", booth: "B18", hall: "1", icon: "air", color: "#1487C9", accent: "#E65539", recommended: true },
      { id: "exhibitor-3", name: "Airtel", role: "Telecom", business: "Connectivity", booth: "A1", hall: "1", icon: "wifi-tethering", color: "#E40000", accent: "#D71920", recommended: true },
      { id: "exhibitor-4", name: "Altera", role: "Infrastructure", business: "Infrastructure", booth: "A22 & A23", hall: "1", icon: "memory", color: "#173A74", accent: "#37A7DF", recommended: true },
      { id: "exhibitor-5", name: "Charge Grid", role: "EV Infrastructure", business: "EV Infrastructure", booth: "C07", hall: "2", icon: "ev-station", color: "#1A73E8", accent: "#2F9E57" },
      { id: "exhibitor-6", name: "FleetOps", role: "Fleet Solutions", business: "Fleet Solutions", booth: "C12", hall: "2", icon: "route", color: "#E65539", accent: "#1A73E8" },
      { id: "exhibitor-7", name: "Urban Move", role: "Mobility Platform", business: "Mobility Platform", booth: "D03", hall: "3", icon: "commute", color: "#7E4CCB", accent: "#F4B400" },
      { id: "exhibitor-8", name: "Mobility Tech", role: "Smart Transit", business: "Technology", booth: "D16", hall: "3", icon: "developer-board", color: "#128A43", accent: "#1A73E8" },
    ],
  },
  Startup: {
    items: [
      { id: "startup-1", name: "RouteIQ", role: "AI Scheduling", business: "AI", booth: "S01", hall: "5", icon: "auto-graph", color: "#008D7A", accent: "#1A73E8", recommended: true },
      { id: "startup-2", name: "Parkly", role: "Smart Parking", business: "Parking", booth: "S04", hall: "5", icon: "local-parking", color: "#F4511E", accent: "#7430C4" },
      { id: "startup-3", name: "EcoRide", role: "Shared Mobility", business: "Mobility Platform", booth: "S09", hall: "5", icon: "eco", color: "#2F9E57", accent: "#F4B400", recommended: true },
      { id: "startup-4", name: "PayTransit", role: "Ticketing Startup", business: "Ticketing", booth: "S13", hall: "5", icon: "confirmation-number", color: "#1D5FAF", accent: "#E65539" },
      { id: "startup-5", name: "VoltLoop", role: "Battery Analytics", business: "EV Infrastructure", booth: "S18", hall: "6", icon: "battery-charging-full", color: "#7430C4", accent: "#2F9E57" },
      { id: "startup-6", name: "BusMate", role: "Operator Tools", business: "Fleet Solutions", booth: "S21", hall: "6", icon: "directions-bus", color: "#DA7B00", accent: "#1A73E8" },
      { id: "startup-7", name: "MapMint", role: "Route Mapping", business: "Technology", booth: "S28", hall: "6", icon: "map", color: "#128A43", accent: "#F4511E" },
      { id: "startup-8", name: "Ticketly", role: "Fare Platform", business: "Ticketing", booth: "S33", hall: "6", icon: "qr-code-2", color: "#173A74", accent: "#37A7DF", recommended: true },
    ],
  },
};

export default function Exhibition({
  filters = {},
  initialBookmarkedItemIds = [],
  initialActiveTab = "Partners",
  onBack,
  onOpenFilter,
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const [activeTab, setActiveTab] = useState(
    tabs.includes(initialActiveTab) ? initialActiveTab : "Partners"
  );
  const [searchText, setSearchText] = useState("");
  const [bookmarkedItemIds, setBookmarkedItemIds] = useState(initialBookmarkedItemIds);
  const activeSection = exhibitionData[activeTab];
  const visibleItems = getVisibleItems(activeSection.items, searchText, filters, bookmarkedItemIds);

  useEffect(() => {
    setBookmarkedItemIds(initialBookmarkedItemIds);
  }, [initialBookmarkedItemIds.join(",")]);

  useEffect(() => {
    if (tabs.includes(initialActiveTab)) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  const toggleBookmark = (itemId) => {
    setBookmarkedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Header
          title="Exhibition"
          onBack={onBack}
          contentWidth={contentWidth}
          
        >
          <View style={styles.headerControls}>
            <Card style={styles.tabCard}>
              {tabs.map((tab) => {
                const isActive = tab === activeTab;

                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.84}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </Card>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={27} color="#363236" />
                <TextInput
                  placeholder="Search here"
                  placeholderTextColor="#918889"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                />
                {searchText ? (
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setSearchText("")}>
                    <Ionicons name="close-circle" size={25} color="#B6B7BE" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onOpenFilter?.(bookmarkedItemIds, filters)}
                style={[styles.filterButton, hasActiveFilters(filters) && styles.filterButtonActive]}
              >
                <Ionicons
                  name="filter-outline"
                  size={27}
                  color={hasActiveFilters(filters) ? colors.white : "#363236"}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.countLabel}>Total Count ({visibleItems.length})</Text>
          </View>
        </Header>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <View style={styles.cardGrid}>
            {visibleItems.map((item) => {
              const isBookmarked = bookmarkedItemIds.includes(item.id);

              return (
              <TouchableOpacity key={item.id} activeOpacity={0.85} style={styles.partnerCard}>
                {item.recommended ? (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleBookmark(item.id)}
                  style={styles.itemBookmark}
                >
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={27}
                    color={isBookmarked ? colors.primary : "#363236"}
                  />
                </TouchableOpacity>

                <LogoMark item={item} />
                <Text numberOfLines={2} style={styles.partnerName}>
                  {item.name}
                </Text>
                <Text numberOfLines={1} style={styles.partnerRole}>
                  {item.role}
                </Text>
                <Text style={styles.boothText}>Booth No. {item.booth}</Text>
                <Text style={styles.hallText}>Hall No. {item.hall}</Text>
              </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

function LogoMark({ item }) {
  return (
    <View style={styles.logoMark}>
      <MaterialIcons name={item.icon} size={44} color={item.color} />
    </View>
  );
}

function getVisibleItems(items, searchText, filters, bookmarkedItemIds) {
  const cleanSearch = searchText.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const matchesSearch = cleanSearch
      ? [item.name, item.role, item.business, item.booth, item.hall]
          .join(" ")
          .toLowerCase()
          .includes(cleanSearch)
      : true;
    const matchesHall = !filters.hall || filters.hall === "Choose Hall" || item.hall === filters.hall;
    const matchesBusiness =
      !Array.isArray(filters.businessAreas) ||
      filters.businessAreas.length === 0 ||
      filters.businessAreas.includes(item.business);
    const matchesBookmark = !filters.bookmarkOnly || bookmarkedItemIds.includes(item.id);

    return matchesSearch && matchesHall && matchesBusiness && matchesBookmark;
  });

  return filteredItems.sort((first, second) => {
    if (filters.sortBy === "name-desc") {
      return second.name.localeCompare(first.name);
    }

    return first.name.localeCompare(second.name);
  });
}

function hasActiveFilters(filters) {
  return Boolean(
    filters.sortBy === "name-desc" ||
      (filters.hall && filters.hall !== "Choose Hall") ||
      (Array.isArray(filters.businessAreas) && filters.businessAreas.length > 0) ||
      filters.bookmarkOnly
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerControls: {
    gap: 14,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  bookmarkButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -58,
    gap: 18,
  },
  tabCard: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6E4DE",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.topSection,
  },
  tabText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: "#17171A",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  searchBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: 24,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    gap: 14,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 18,
    paddingVertical: 0,
  },
  filterButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.topSection,
  },
  countLabel: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    paddingHorizontal: 4,
  },
  
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  partnerCard: {
    width: "47.5%",
    minHeight: 252,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    backgroundColor: colors.white,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 38,
    paddingBottom: 18,
    position: "relative",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  recommendedBadge: {
    position: "absolute",
    top: 16,
    left: 14,
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#1C86B7",
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  itemBookmark: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    width: 100,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 16,
  },
  
  partnerName: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    textAlign: "center",
    minHeight: 44,
    textTransform: "uppercase",
  },
  partnerRole: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  boothText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  hallText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
 
});
