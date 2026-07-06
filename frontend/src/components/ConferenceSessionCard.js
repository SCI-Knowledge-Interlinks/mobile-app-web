import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../constants/colors";
import { fontFamily } from "../constants/typography";

const speakerPlaceholder = require("../assets/speaker_profile.png");

export default function ConferenceSessionCard({
  session,
  onPress,
  onOpenSpeakerProfile,
  isBookmarked = false,
  onToggleBookmark,
  showDivider = true,
  showTimelineLine = false,
}) {
  const { start: startTime, end: endTime } = parseSessionTime(session.time);
  const sessionSpeakers = getSessionSpeakers(session);

  return (
    <View style={styles.cardWrap}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onPress?.(session)}
        style={styles.row}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={(event) => {
            event.stopPropagation?.();
            onToggleBookmark?.(session.id);
          }}
          style={styles.bookmarkButton}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? colors.brandBlue : colors.placeholder}
          />
        </TouchableOpacity>

        <View style={styles.timeColumn}>
          <Text style={styles.startTime}>{startTime} to </Text>
          {endTime ? <Text style={styles.endTime}>{endTime}</Text> : null}
        </View>

        <View style={styles.timelineColumn}>
          <View style={styles.timelineDot} />
          {showTimelineLine ? <View style={styles.timelineLine} /> : null}
        </View>

        <View style={styles.contentColumn}>
        <Text style={styles.track}>{session.track}</Text>
        <Text style={styles.title} numberOfLines={3}>
          {session.title}
        </Text>

        {/* <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#8E8E99" />
          <Text style={styles.metaText} numberOfLines={2}>
            {session.place}
          </Text>
        </View> */}

        {/* {sessionSpeakers.length > 0 ? (
          <View style={styles.speakersRow}>
            {sessionSpeakers.map((speaker, index) => (
              <TouchableOpacity
                key={`${session.id}-${speaker.id || index}`}
                activeOpacity={0.85}
                // onPress={(event) => {
                //   event.stopPropagation?.();
                //   onOpenSpeakerProfile?.(speaker);
                // }}
                style={[
                  styles.speakerAvatarWrap,
                  index > 0 && styles.speakerAvatarOverlap,
                ]}
              >
                <Image
                  source={
                    speaker.imageUrl ? { uri: speaker.imageUrl } : speakerPlaceholder
                  }
                  style={styles.speakerAvatar}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : null} */}
        </View>

        <View style={styles.chevronWrap}>
          <Ionicons name="chevron-forward" size={18} color="#C5C5C5" />
        </View>
      </TouchableOpacity>
      {showDivider ? <View style={styles.rowDivider} /> : null}
    </View>
  );
}

function parseSessionTime(timeValue) {
  if (!timeValue) return { start: "", end: "" };

  const parts = String(timeValue).split(/\s*-\s*/);
  if (parts.length < 2) {
    return { start: timeValue, end: "" };
  }

  const start = parts[0].trim();
  let end = parts.slice(1).join("-").trim();
  const period = end.match(/\b(AM|PM)\b/i)?.[0];

  if (period && !/\b(AM|PM)\b/i.test(start)) {
    return { start: `${start} ${period}`, end };
  }

  return { start, end };
}

function getSessionSpeakers(session) {
  const speakerDetails = session.speakerDetails || [];
  if (speakerDetails.length > 0) {
    return speakerDetails.map((speaker) => ({
      id: speaker.id,
      name: speaker.name || speaker.initials,
      role: speaker.role || "Speaker",
      company: speaker.company || "",
      about: speaker.about || speaker.bio || "",
      imageUrl: speaker.imageUrl || "",
      speakerType: speaker.speakerType || speaker.speaker_type || "Speaker",
    }));
  }

  return (session.speakers || []).map((initials, index) => ({
    id: `${session.id}-speaker-${index}`,
    name: initials,
    role: "Speaker",
    company: "",
    about: "",
    imageUrl: "",
    speakerType: "Speaker",
  }));
}

const styles = StyleSheet.create({
  cardWrap: {
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  bookmarkButton: {
    position: "absolute",
    top: 14,
    right: 10,
    zIndex: 1,
    padding: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 14,
    marginRight: 14,
  },
  timeColumn: {
    width: 78,
    justifyContent: "flex-start",
    paddingTop: 2,
    gap: 4,
  },
  startTime: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 18,
    color: "#1D1D1F",
  },
  endTime: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 17,
    color: "#999999",
  },
  timelineColumn: {
    width: 20,
    alignItems: "center",
    alignSelf: "stretch",
    paddingTop: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandBlue,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    backgroundColor: "#E3E3E3",
    minHeight: 24,
  },
  contentColumn: {
    flex: 1,
    minWidth: 0,
    gap: 6,
    paddingRight: 8,
  },
  track: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brandBlue,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 21,
    color: "#1D1D1F",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  speakersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  speakerAvatarWrap: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.white,
  },
  speakerAvatarOverlap: {
    marginLeft: -8,
   
  },
  speakerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8ECF2",
    marginHorizontal: 5,
  },
  chevronWrap: {
    justifyContent: "center",
    paddingLeft: 2,
  },
});
