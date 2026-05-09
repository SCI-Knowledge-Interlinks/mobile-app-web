import React, { useMemo } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Header } from "../components";
import { colors } from "../constants/colors";
import { layout } from "../constants/layout";
import { spacing } from "../constants/spacing";


const youthIcon = require("../assets/youth.png");

const quickItems = [
  { label: "My Schedule", icon: "calendar-month", iconSet: "MaterialIcons" },
  { label: "Speakers", icon: "groups", iconSet: "MaterialIcons" },
  { label: "Exhibition", icon: "storefront", iconSet: "MaterialIcons" },
  { label: "Youth Corridor", icon: "location-outline", iconSet: "MaterialIcons" },
];

const exploreItems = [
  { label: "Partners", bg: colors.successLight },
  { label: "Startup", bg: "#FFF3EF" },
  { label: "F&B", bg: "#F4EDFF" },
];

const engagementItems = [
  { label: "Poll", icon: "poll", color: "#008D7A", bg: colors.successLight },
  { label: "Photo Booth", icon: "photo-camera", color: "#7E4CCB", bg: "#F4EDFF" },
];

const visitorItems = [
  { label: "Floor Plan", icon: "map", color: "#1A73E8", bg: "#EAF4FF" },
  { label: "Event Info", icon: "info-outline", color: colors.success, bg: colors.successLight },
  { label: "Agenda", icon: "event", color: "#7E4CCB", bg: "#F4EDFF" },
  { label: "Resource Centre", icon: "menu-book", color: "#F4511E", bg: "#FFF3EF" },
  { label: "Survey Form", icon: "fact-check", color: "#D92D20", bg: "#FFEDEA" },
];

const moreItems = [
  { label: "Helpdesk", icon: "support-agent", color: "#1A73E8", bg: "#EAF4FF" },
  { label: "Gallery", icon: "photo-library", color: "#7E4CCB", bg: "#F4EDFF" },
  { label: "Facility", icon: "business", color: colors.success, bg: colors.successLight },
];

export default function EventHub() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Header title="Event Hub" contentWidth={contentWidth}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Your all-in-one event experience</Text>
            <Text style={styles.heroText}>
              Explore, connect and engage everything in one place.
            </Text>
          </View>
        </Header>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <Card style={styles.quickCard}>

             <SectionTitle title="Quick Access" />

            <View style={styles.quickGrid}>
              {quickItems.map((item) => (
                <TouchableOpacity key={item.label} activeOpacity={0.84} style={styles.quickItem}>
                  <View style={styles.quickIconBox}>
                    {item.label === "Youth Corridor" ? (
                      <Image
                        source={youthIcon}
                        style={styles.actionImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <MaterialIcons name={item.icon} size={29} color={colors.success} />
                    )}
                  </View>
                  <Text style={styles.quickText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.exploreCard}>
            <SectionTitle title="Explore" />
            <View style={styles.exploreGrid}>
              {exploreItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.84}
                  style={[styles.exploreItem, { backgroundColor: item.bg }]}
                >
                  <Text style={styles.exploreText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <SectionTitle title="Engagement Zone" />
            <View style={styles.engagementGrid}>
              {engagementItems.map((item) => (
                <TouchableOpacity key={item.label} activeOpacity={0.84} style={styles.engagementItem}>
                  <View style={[styles.zoneIconBox, { backgroundColor: item.bg }]}>
                    <MaterialIcons name={item.icon} size={31} color={item.color} />
                  </View>
                  <Text style={styles.zoneTitle}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.sectionCard}>
             <SectionTitle title="Visitor Information" />
            <View style={styles.infoList}>
              {visitorItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.84}
                  style={[
                    styles.infoRow,
                    index < visitorItems.length - 1 && styles.infoRowBorder,
                  ]}
                >
                  <View style={[styles.listIconBox, { backgroundColor: item.bg }]}>
                    <MaterialIcons name={item.icon} size={25} color={item.color} />
                  </View>
                  <Text style={styles.listTitle}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <SectionTitle title="More" />
            <View style={styles.infoList}>
              {moreItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.84}
                  style={[
                    styles.infoRow,
                    index < moreItems.length - 1 && styles.infoRowBorder,
                  ]}
                >
                  <View style={[styles.listIconBox, { backgroundColor: item.bg }]}>
                    <MaterialIcons name={item.icon} size={25} color={item.color} />
                  </View>
                  <Text style={styles.listTitle}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    paddingHorizontal: layout.topBarHorizontalMargin,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -40,
    gap: 12,
  },
  quickCard: {
    borderRadius: 18,
    padding: 20,
  },
  exploreCard: {
    borderRadius: 18,
    padding: 20,
  },
  sectionCard: {
    borderRadius: 18,
    padding: 20,
  },
  quickHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickItem: {
    flex: 1,
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  quickIconBox: {
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  quickText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  exploreGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 16,
  },
  exploreItem: {
    flex: 1,
    minHeight: 70,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  exploreText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  engagementGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 16,
  },
  engagementItem: {
    flex: 1,
    minHeight: 108,
    borderRadius: 16,
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  zoneIconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  zoneTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  infoList: {
    marginTop: 10,
  },
  infoRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  listTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "900",
  },
   actionImage: {
    width: 29,
    height: 29,
    tintColor: colors.success,
  }
});
