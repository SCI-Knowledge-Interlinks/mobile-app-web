import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ConferenceSessionCard from "../components/ConferenceSessionCard";
import ListSearchBar from "../components/ListSearchBar";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { getConferenceDays, getSessionsList } from "../services/eventSessionService";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";
import { compareSessionsByStartTime } from "../utils/sessionTimeUtils";

const fallbackDays = [
  { label: "Day 1", date: "9th Jul'26" },
  { label: "Day 2", date: "10th Jul'26" },
  { label: "Day 3", date: "11th Jul'26" },
];

export default function ConferenceListScreen({
  onBack,
  onOpenSessionDetails,
  onOpenSpeakerProfile,
}) {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [searchText, setSearchText] = useState("");
  const [sessions, setSessions] = useState([]);
  const [days, setDays] = useState(fallbackDays);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedSessionIds, setBookmarkedSessionIds] = useState([]);

  const toggleBookmark = (sessionId) => {
    setBookmarkedSessionIds((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId]
    );
  };

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        setIsLoading(true);
        const [apiSessions, apiDays] = await Promise.all([
          getSessionsList(),
          getConferenceDays().catch(() => fallbackDays),
        ]);
        if (isMounted) {
          setSessions(apiSessions);
          if (apiDays?.length) {
            setDays(apiDays);
            setSelectedDay((current) => current || apiDays[0]?.label || "Day 1");
          }
        }
      } catch (error) {
        console.log("Conference sessions API failed:", error.message);
        if (isMounted) {
          setSessions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleSessions = useMemo(() => {
    const filtered = sessions.filter((session) =>
      matchesSessionFilters(session, selectedDay, searchText)
    );

    return [...filtered].sort(compareSessionsByStartTime);
  }, [sessions, selectedDay, searchText]);

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Conference" onBack={onBack} />
      <ListSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search sessions"
        rounded
      />

      <View style={styles.dayTabs}>
        {days.map((day) => {
          const active = selectedDay === day.label;

          return (
            <TouchableOpacity
              key={day.label}
              activeOpacity={0.85}
              onPress={() => setSelectedDay(day.label)}
              style={styles.dayTab}
            >
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                {day.label}
              </Text>
              <Text style={styles.dayDate}>{day.date}</Text>
              {active ? <View style={styles.dayIndicator} /> : <View style={styles.dayIndicatorSpacer} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: scrollBottomPadding(insets) },
          ]}
        >
          {visibleSessions.length === 0 ? (
            <Text style={commonStyles.emptyState}>
              {searchText.trim()
                ? "No sessions match your search."
                : "No sessions scheduled for this day."}
            </Text>
          ) : (
            <View style={styles.listCard}>
              {visibleSessions.map((session, index) => (
                <ConferenceSessionCard
                  key={session.id}
                  session={session}
                  isBookmarked={bookmarkedSessionIds.includes(session.id)}
                  onToggleBookmark={toggleBookmark}
                  showDivider={true}
                  showTimelineLine={true}
                  onPress={(item) => onOpenSessionDetails?.(item)}
                  onOpenSpeakerProfile={onOpenSpeakerProfile}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function matchesSessionFilters(session, selectedDay, searchText) {
  if (session.day !== selectedDay) return false;

  const query = searchText.trim().toLowerCase();
  if (!query) return true;

  const searchableText = [
    session.track,
    session.title,
    session.time,
    session.place,
    getSpeakerSearchText(session),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

function getSpeakerSearchText(session) {
  const speakerDetails = session.speakerDetails || [];
  if (speakerDetails.length > 0) {
    return speakerDetails.map((speaker) => speaker.name).join(" ");
  }

  return (session.speakers || []).join(" ");
}

const styles = StyleSheet.create({
  dayTabs: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm + 2,
    backgroundColor: colors.pageBackground,
  },
  dayTab: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  dayLabel: {
    ...textPresets.sectionTitle,
    fontSize: 16,
    color: colors.textSecondary,
  },
  dayLabelActive: {
    color: colors.brandBlue,
  },
  dayDate: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    color: "#333333",
  },
  dayIndicator: {
    marginTop: spacing.xs,
    width: "72%",
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
  dayIndicatorSpacer: {
    marginTop: spacing.xs,
    height: 3,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    ...commonStyles.cardShadow,
  },
});
