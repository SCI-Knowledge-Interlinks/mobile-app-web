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

import { Card, Header, NoDataCard } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { getSessionsList } from "../services/eventSessionService";

const days = [
  { label: "Day 1", date: "9th July" },
  { label: "Day 2", date: "10th July" },
  { label: "Day 3", date: "11th July" },
];


export default function EventSessions({
  filters = {},
  bookmarkedSessionIds = [],
  onOpenSessionDetails,
  onOpenFilter,
  onToggleBookmark,
}) {
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const isCompact = width < 560;
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [searchText, setSearchText] = useState("");
  const [sessions, setSessions] = useState([]);
  const visibleSessions = sessions.filter((session) =>
    shouldShowSession(session, selectedDay, searchText, filters, bookmarkedSessionIds)
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        const apiSessions = await getSessionsList();
        if (isMounted) {
          setSessions(apiSessions);
        }
      } catch (error) {
        console.log("Sessions list API failed:", error.message);
        if (isMounted) {
          setSessions([]);
        }
      }
    }

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header
          title="Sessions"
          contentWidth={contentWidth}
          rightContent={
            <View style={styles.headerActions}>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
                <MaterialIcons name="notifications-none" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
                <MaterialIcons name="chat" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          }
        >
          <DayTabs
            days={days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

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
            <TouchableOpacity activeOpacity={0.8} onPress={onOpenFilter} style={styles.filterButton}>
              <Ionicons name="filter-outline" size={27} color="#363236" />
            </TouchableOpacity>
          </View>
        </Header>

        <View
          style={[
            styles.sessionsWrap,
            { maxWidth: contentWidth },
            isCompact && styles.sessionsWrapCompact,
          ]}
        >
          {visibleSessions.length > 0 ? (
            visibleSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isCompact={isCompact}
                isBookmarked={bookmarkedSessionIds.includes(session.id)}
                onOpenSessionDetails={onOpenSessionDetails}
                onToggleBookmark={onToggleBookmark}
              />
            ))
          ) : (
            <NoDataCard icon="calendar-clear-outline" style={styles.sessionsEmptyCard} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DayTabs({ days, selectedDay, onSelectDay }) {
  return (
    <View style={styles.dayTabs}>
      {days.map((day) => {
        const active = selectedDay === day.label;

        return (
          <TouchableOpacity
            key={day.label}
            activeOpacity={0.85}
            onPress={() => onSelectDay(day.label)}
            style={[styles.dayTab, active && styles.activeDayTab]}
          >
            <Text style={[styles.dayText, active && styles.activeDayText]}>
              {day.label}
            </Text>
            <Text style={[styles.dayDateText, active && styles.activeDayDateText]}>
              {day.date}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SessionCard({
  session,
  isCompact,
  isBookmarked,
  onOpenSessionDetails,
  onToggleBookmark,
}) {
  const statusStyle = getStatusStyle(session.sessionStatus);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onOpenSessionDetails?.(session)}
    >
    <Card style={[styles.sessionCard, isCompact && styles.sessionCardCompact]}>
      <View style={[styles.sessionContent, isCompact && styles.sessionContentCompact]}>
        <View
          style={[
            styles.trackIconBox,
            isCompact && styles.trackIconBoxCompact,
            { backgroundColor: session.bg },
          ]}
        >
          <MaterialIcons
            name={session.icon}
            size={isCompact ? 30 : 38}
            color={session.color}
          />
        </View>

        <View style={styles.sessionInfo}>
          <View style={styles.sessionTopRow}>
            <View style={styles.titleInfo}>
              <View style={styles.trackRow}>
                <View
                  style={[
                    styles.trackBadge,
                    isCompact && styles.trackBadgeCompact,
                    { backgroundColor: session.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.trackText,
                      isCompact && styles.trackTextCompact,
                      { color: session.color },
                    ]}
                  >
                    {session.track.toUpperCase()}
                  </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                  <Text style={[styles.statusText, { color: statusStyle.color }]}>
                    {session.sessionStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.titleActionRow}>
                <Text
                  style={[
                    styles.sessionTitle,
                    isCompact && styles.sessionTitleCompact,
                  ]}
                >
                  {session.title}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onOpenSessionDetails?.(session)}
                  style={styles.titleArrowButton}
                >
                  <MaterialIcons name="arrow-forward-ios" size={20} color={colors.iconMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(event) => {
                  event.stopPropagation();
                  onToggleBookmark?.(session.id);
                }}
                style={styles.cardActionButton}
              >
                <MaterialIcons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={27}
                  color={isBookmarked ? colors.primary : colors.iconMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={19} color="#756A6A" />
              <Text style={styles.detailText}>{session.time}</Text>
            </View>
           
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={19} color="#756A6A" />
              <Text style={styles.detailText}>{session.place}</Text>
            </View>
          </View>

          {(session.speakers.length > 0 || session.extraSpeakers > 0) && (
            <View style={styles.speakerRow}>
              {session.speakers.map((speaker, index) => (
                <View
                  key={`${session.id}-${speaker}`}
                  style={[
                    styles.speakerAvatar,
                    index > 0 && styles.speakerAvatarOverlap,
                  ]}
                >
                  <Text style={styles.speakerText}>{speaker}</Text>
                </View>
              ))}
              {session.extraSpeakers > 0 && (
                <View style={[styles.extraAvatar, { backgroundColor: session.bg }]}>
                  <Text style={[styles.extraText, { color: session.color }]}>
                    +{session.extraSpeakers}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Card>
    </TouchableOpacity>
  );
}

function shouldShowSession(session, selectedDay, searchText, filters, bookmarkedSessionIds) {
  if (session.day !== selectedDay) return false;

  const cleanSearch = searchText.trim().toLowerCase();
  if (cleanSearch) {
    const searchableText = [
      session.track,
      session.title,
      session.sessionStatus,
    ]
      .join(" ")
      .toLowerCase();

    if (!searchableText.includes(cleanSearch)) return false;
  }

  if (filters.category && filters.category !== "Choose Category") {
    if (session.track !== filters.category) return false;
  }

  if (filters.venue && filters.venue !== "Choose Venue") {
    if (!session.place.toLowerCase().includes(filters.venue.toLowerCase())) return false;
  }

  if (filters.timeSlot && getSessionTimeSlot(session.time) !== filters.timeSlot) {
    return false;
  }

  if (filters.bookmarkOnly && !bookmarkedSessionIds.includes(session.id)) {
    return false;
  }

  return true;
}

function getSessionTimeSlot(time) {
  const match = time.match(/^(\d{1,2}):/);
  if (!match) return "";

  const hour = Number(match[1]);
  const isPm = time.toUpperCase().includes("PM");
  const hour24 = isPm && hour !== 12 ? hour + 12 : hour;

  if (hour24 < 12) return "morning";
  if (hour24 < 17) return "afternoon";
  return "evening";
}

function getStatusStyle(status) {
  if (status === "LIVE") {
    return {
      bg: "#FFEDEA",
      color: "#E65539",
    };
  }

  return {
    bg: "#EAF4FF",
    color: "#1A73E8",
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.softBackground,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
   iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 0,
    gap: 12,
    flexShrink: 0,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: 4,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dayTabs: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 28,
    padding: 6,
    marginBottom: 26,
  },
  dayTab: {
    flex: 1,
    minHeight: 50,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDayTab: {
    backgroundColor: colors.topSection,
  },
  dayText: {
    color: "#343033",
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "800",
  },
  activeDayText: {
    color: colors.white,
  },
  dayDateText: {
    color: "#6C6465",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  activeDayDateText: {
    color: "rgba(255,255,255,0.9)",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: 28,
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
  
  sessionsWrap: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -60,
    gap: 12,
    // minHeight: 430,
  },
  sessionsWrapCompact: {
    marginTop: -58,
  },
  sessionCard: {
    borderRadius: 22,
    padding: 20,
    position: "relative",
  },
  sessionsEmptyCard: {
    minHeight: 420,
  },
  sessionCardCompact: {
    padding: 18,
  },
  sessionContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  sessionContentCompact: {
    gap: spacing.md,
  },
  trackIconBox: {
    width: 104,
    height: 104,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  trackIconBoxCompact: {
    width: 76,
    height: 76,
    borderRadius: 22,
  },
  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },
  sessionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    position: "relative",
  },
  titleInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    paddingRight: 42,
  },
  trackBadge: {
    alignSelf: "flex-start",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  trackBadgeCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trackText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
  },
  trackTextCompact: {
    fontSize: 11,
  },
  statusBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },
  cardActions: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    alignItems: "center",
    gap: 8,
  },
  cardActionButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  titleActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
    paddingRight: 42,
    position: "relative",
  },
  sessionTitle: {
    flex: 1,
    minWidth: 0,
    color: "#2B2629",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "900",
  },
  sessionTitleCompact: {
    fontSize: 19,
    lineHeight: 25,
  },
  titleArrowButton: {
    position: "absolute",
    right: 0,
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: "#5F5556",
    fontSize: 15,
    lineHeight: 20,
  },
  
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
  },
  speakerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: "#4A3D3C",
    alignItems: "center",
    justifyContent: "center",
  },
  speakerAvatarOverlap: {
    marginLeft: -7,
  },
  speakerText: {
    color: colors.white,
    fontSize: 7,
    fontWeight: "800",
  },
  extraAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  extraText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
