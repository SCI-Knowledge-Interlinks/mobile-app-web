import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { EVENT_JOURNEY_POINTS } from "../services/eventJourneyTracker";
import { useEventJourneySummaryLoader } from "../hooks/useEventJourney";
import { fontFamily, textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const EMPTY_SUMMARY = {
  activities: [],
  totalScore: 0,
  maxScore: 0,
  progressPercent: 0,
};

export default function EventJourneyScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const loadSummary = useCallback((nextSummary) => {
    setSummary(nextSummary);
  }, []);

  useEventJourneySummaryLoader(loadSummary);

  const clampedProgress = Math.min(
    100,
    Math.max(0, Number(summary.progressPercent) || 0)
  );

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Event Journey" onBack={onBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your event progress</Text>
          <Text style={styles.cardSubtitle}>
            Earn points once for each activity.
          </Text>
          {/* {EVENT_JOURNEY_POINTS} Repeat visits do not add more points. */}

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Total score</Text>
            {/* <Text style={styles.scoreValue}>
              {summary.totalScore} / {summary.maxScore} pts
            </Text> */}
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Completion</Text>
            <Text style={styles.progressValue}>{clampedProgress}%</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${clampedProgress}%` }]} />
          </View>

          <View style={styles.progressScale}>
            <Text style={styles.scaleText}>0%</Text>
            <Text style={styles.scaleText}>100%</Text>
          </View>
        </View>

        {/* <Text style={styles.listTitle}>Activities</Text>
        <View style={styles.activityList}>
          {summary.activities.map((activity) => (
            <View
              key={activity.key}
              style={[
                styles.activityRow,
                activity.completed && styles.activityRowCompleted,
              ]}
            >
              <View
                style={[
                  styles.activityIconWrap,
                  activity.completed && styles.activityIconWrapCompleted,
                ]}
              >
                <Ionicons
                  name={activity.completed ? "checkmark" : "ellipse-outline"}
                  size={16}
                  color={activity.completed ? colors.white : colors.textMutedLight}
                />
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityLabel}>{activity.label}</Text>
                <Text style={styles.activityPoints}>
                  {activity.completed ? `+${activity.points} pts` : `+${activity.points} pts available`}
                </Text>
              </View>
            </View>
          ))}
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm + 4,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    ...textPresets.sectionTitle,
    color: colors.text,
    fontFamily: fontFamily.bold,
  },
  cardSubtitle: {
    ...textPresets.infoBody,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  scoreLabel: {
    ...textPresets.caption,
    fontFamily: fontFamily.medium,
    color: colors.text,
  },
  scoreValue: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.brandBlue,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  progressLabel: {
    ...textPresets.caption,
    fontFamily: fontFamily.medium,
    color: colors.text,
  },
  progressValue: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.brandBlue,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.borderInput,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.brandBlue,
  },
  progressScale: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scaleText: {
    ...textPresets.caption,
    color: colors.textMutedLight,
  },
  listTitle: {
    ...textPresets.sectionTitle,
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  activityList: {
    gap: spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityRowCompleted: {
    borderColor: "rgba(11, 60, 109, 0.18)",
    backgroundColor: "#F7FAFD",
  },
  activityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.pageBackgroundSoft,
  },
  activityIconWrapCompleted: {
    backgroundColor: colors.brandBlue,
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityLabel: {
    ...textPresets.caption,
    fontFamily: fontFamily.medium,
    color: colors.text,
    fontSize: 14,
  },
  activityPoints: {
    ...textPresets.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
});
