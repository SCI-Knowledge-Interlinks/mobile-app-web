import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { getSessionById } from "../services/eventService";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";
import { mapSpeaker } from "../utils/contentMappers";

const defaultSpeakerPhoto = require("../assets/default_photo.png");

export default function SessionDetailsScreenNew({ session, onBack, onOpenSpeakerInfo }) {
  const insets = useSafeAreaInsets();
  const [sessionData, setSessionData] = useState(() => normalizeSession(session));
  const speakers = getSessionSpeakers(sessionData);

  useEffect(() => {
    const sessionId = session?.id;
    if (!sessionId) return undefined;

    let isMounted = true;

    async function loadSessionDetails() {
      try {
        const apiSession = await getSessionById(sessionId);
        if (isMounted && apiSession) {
          setSessionData(normalizeSession(apiSession));
        }
      } catch (error) {
        console.log("Session details API failed:", error.message);
      }
    }

    loadSessionDetails();

    return () => {
      isMounted = false;
    };
  }, [session?.id]);

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title="Session Details" onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        <InfoDetailCard
          heading="ABOUT SESSION"
          body={sessionData.about}
          topContent={
            <View style={styles.sessionTop}>
              <Text style={styles.sessionTitle}>{sessionData.title}</Text>
              <View style={styles.venueRow}>
              <Ionicons name="time-outline" size={19} color={colors.textSecondary} />
              <Text style={styles.sessionMeta}>
                {sessionData.time}
                <Text style={styles.dot}> • </Text>
                {sessionData.dateLine}
              </Text>
              </View>
              {/* <View style={styles.venueRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.venueText}>{data.place}</Text>
              </View> */}
            </View>
          }
        />

        {speakers.length > 0 ? (
          <View style={styles.speakersCard}>
            <Text style={styles.speakersHeading}>Speakers</Text>
            {speakers.map((speaker, index) => (
              <TouchableOpacity
                key={speaker.id || index}
                activeOpacity={0.85}
                onPress={() => onOpenSpeakerInfo?.({ speaker })}
                style={[
                  styles.speakerRow,
                  index < speakers.length - 1 && styles.speakerRowBorder,
                ]}
              >
                <SpeakerPhoto imageUrl={speaker.imageUrl} />
                <View style={styles.speakerInfo}>
                  <Text style={styles.speakerType}>{speaker.speakerType}</Text>
                  <Text style={styles.speakerName} numberOfLines={1}>
                    {speaker.name}
                  </Text>
                  <Text style={styles.speakerRole} numberOfLines={1}>
                    {speaker.role}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#B6B7BE" />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function normalizeSession(session) {
  const item = session || {};
  return {
    id: item.id || "",
    title: item.title || "Session",
    time: item.time || "",
    date: item.date || "",
    dateLine: formatSessionDateLine(item.date),
    place: item.place || "",
    about: item.about || "",
    track: item.track || "",
    speakerDetails: item.speakerDetails || [],
    speakers: item.speakers || [],
    extraSpeakers: item.extraSpeakers || 0,
  };
}

function formatSessionDateLine(dateValue) {
  if (!dateValue) return "9th July 2026";

  const value = String(dateValue).trim();
  if (/202\d/.test(value)) return value;

  return `${value} 2026`;
}

function SpeakerPhoto({ imageUrl }) {
  const [hasError, setHasError] = useState(false);
  const source =
    imageUrl && !hasError ? { uri: imageUrl } : defaultSpeakerPhoto;

  return (
    <Image
      source={source}
      style={styles.speakerImage}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
}

function getSessionSpeakers(session) {
  const speakerDetails = session.speakerDetails || [];
  if (speakerDetails.length > 0) {
    return speakerDetails.map((speaker, index) => {
      const mapped = mapSpeaker(speaker, index);

      return {
        id: mapped.id,
        name: mapped.name || mapped.initials,
        role: mapped.role || "Speaker",
        speakerType: mapped.speakerType || speaker.speaker_type || "Speaker",
        company: mapped.company || "",
        about: mapped.about || "",
        imageUrl: mapped.imageUrl || "",
      };
    });
  }

  const speakers = session.speakers || [];
  if (speakers.length > 0 && typeof speakers[0] === "object") {
    return speakers.map((speaker, index) => {
      const mapped = mapSpeaker(speaker, index);

      return {
        id: mapped.id,
        name: mapped.name || mapped.initials,
        role: mapped.role || "Speaker",
        speakerType: mapped.speakerType || speaker.speaker_type || "Speaker",
        company: mapped.company || "",
        about: mapped.about || "",
        imageUrl: mapped.imageUrl || "",
      };
    });
  }

  return speakers.map((initials, index) => ({
    id: `${session.id}-speaker-${index}`,
    name: initials,
    role: "Speaker",
    speakerType: "Speaker",
    company: "",
    about: "",
    imageUrl: "",
  }));
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  sessionTop: {
    width: "100%",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  sessionTitle: {
    ...textPresets.profileName,
    color: colors.brandBlue,
    textAlign: "left",
  },
  sessionMeta: {
    ...textPresets.infoBody,
    color: colors.textSecondary,
  },
  dot: {
    color: colors.textSecondary,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  venueText: {
    flex: 1,
    ...textPresets.infoBody,
    color: colors.textSecondary,
  },
  speakersCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    ...commonStyles.cardShadowMd,
    overflow: "hidden",
  },
  speakersHeading: {
    ...textPresets.sectionTitle,
    fontSize: 16,
    color: colors.black,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm,
  },
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm + 2,
  },
  speakerRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderInput,
  },
  speakerImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.borderInput,
  },
  speakerInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  speakerType: {
    ...textPresets.labelCondensed,
    color: colors.brandBlue,
    textTransform: "uppercase",
  },
  speakerName: {
    ...textPresets.sectionTitle,
    fontSize: 16,
    color: colors.text,
  },
  speakerRole: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    color: colors.textSecondary,
  },
});
