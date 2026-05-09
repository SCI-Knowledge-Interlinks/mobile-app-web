import React, { useMemo, useState } from "react";
import {
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
import { spacing } from "../constants/spacing";

const days = [
  { label: "Day 1", date: "9th July" },
  { label: "Day 2", date: "10th July" },
  { label: "Day 3", date: "11th July" },
];

const hours = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  label: formatHour(index),
}));

export default function MyCalendar({ onBack }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const [selectedDay, setSelectedDay] = useState("Day 1");

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Header title="My Calendar" onBack={onBack} contentWidth={contentWidth}>
          <View style={styles.dayTabs}>
            {days.map((day) => {
              const active = selectedDay === day.label;

              return (
                <TouchableOpacity
                  key={day.label}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDay(day.label)}
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
        </Header>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <Card style={styles.calendarCard}>

            <View style={styles.timeline}>
              {hours.map((hour) => (
                <View key={hour.id} style={styles.timeRow}>
                  <Text style={styles.timeText}>{hour.label}</Text>
                  <View style={styles.timeLine} />
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function formatHour(hour) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  dayTabs: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 24,
    padding: 5,
  },
  dayTab: {
    flex: 1,
    minHeight: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDayTab: {
    backgroundColor: colors.topSection,
  },
  dayText: {
    color: "#3F3F46",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  activeDayText: {
    color: colors.white,
  },
  dayDateText: {
    color: "#777777",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  activeDayDateText: {
    color: colors.white,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -40,
  },
  calendarCard: {
    borderRadius: 18,
    padding: 18,
  },
  timeline: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  timeRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 14,
  },
  timeText: {
    width: 58,
    color: "#68646A",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  timeLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8E8E8",
    marginTop: 8,
  },
});
