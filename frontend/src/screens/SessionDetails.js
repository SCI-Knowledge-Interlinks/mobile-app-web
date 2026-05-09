import React, { useMemo } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Alert,
  Platform,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Card, Header } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function SessionDetails({ session, onBack, onOpenSpeakerInfo }) {
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const isCompact = width < 560;
  const selectedSession = getSessionDetails(session);
  const speakers = selectedSession.speakerDetails;
  const hasSpeakers = speakers.length > 0;
  const statusStyle = getStatusStyle(selectedSession.status);
  const shareMessage = `${selectedSession.title}\n${selectedSession.time} • ${selectedSession.date}\n${selectedSession.place}`;

  const shareSession = async () => {
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({
            title: selectedSession.title,
            text: shareMessage,
          });
          return;
        }

        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareMessage);
          Alert.alert("Copied", "Session details copied to clipboard.");
        }
        return;
      }

      await Share.share({
        title: selectedSession.title,
        message: shareMessage,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        Alert.alert("Share", "Could not share this session right now.");
      }
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header
          title="Session Details"
          onBack={onBack}
          contentWidth={contentWidth}
          rightContent={
            <View style={styles.topActions}>
              <TouchableOpacity activeOpacity={0.8} style={styles.topIconButton}>
                <Ionicons name="calendar-outline" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.topIconButton}>
                <Ionicons
                  name={selectedSession.isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={shareSession} style={styles.topIconButton}>
                <Ionicons name="share-social-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          }
        >
          <View style={[styles.sessionHeroRow, isCompact && styles.sessionHeroRowCompact]}>
            <View style={styles.heroTextBlock}>
              <View style={styles.trackRow}>
                <View style={[styles.trackBadge, { backgroundColor: selectedSession.bg }]}>
                  <Text style={[styles.trackText, { color: selectedSession.color }]}>
                    {selectedSession.track.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.liveBadge, { backgroundColor: statusStyle.bg }]}>
                  <View style={[styles.liveDot, { backgroundColor: statusStyle.color }]} />
                  <Text style={[styles.liveText, { color: statusStyle.color }]}>
                    {selectedSession.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.sessionTitle}>{selectedSession.title}</Text>
            </View>
          </View>
        </Header>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <Card style={styles.infoCard}>
            <InfoRow
              icon="time-outline"
              label="Time"
              value={`${selectedSession.time} • ${selectedSession.date}`}
            />
            <View style={styles.divider} />
            <InfoRow icon="location-outline" label="Venue" value={selectedSession.place} />
          </Card>

          <Card style={styles.card}>
            <SectionTitle title="About Session" />
            <Text style={styles.bodyText}>{selectedSession.about}</Text>
          </Card>

          {hasSpeakers && (
            <Card style={styles.card}>
              <SectionTitle title="Speakers" />
              <View style={styles.speakersList}>
                {speakers.map((speaker) => (
                  <TouchableOpacity
                    key={speaker.name}
                    activeOpacity={0.82}
                    onPress={() => onOpenSpeakerInfo?.({ speaker, session: selectedSession })}
                    style={styles.speakerRow}
                  >
                    <View style={[styles.avatar, { backgroundColor: getAvatarColor(speaker.initials) }]}>
                      <Text style={styles.avatarText}>{speaker.initials}</Text>
                    </View>
                    <View style={styles.speakerInfo}>
                      <View style={styles.speakerBadge}>
                        <Text style={styles.speakerBadgeText}>
                          {(speaker.speakerType || "Panelist").toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.speakerName}>{speaker.name}</Text>
                      <Text style={styles.speakerRole}>{speaker.role}</Text>
                      <Text style={styles.speakerCompany}>{speaker.company || "Prawaas Mobility"}</Text>
                    </View>
                    <View style={styles.speakerArrowButton}>
                      <MaterialIcons name="chevron-right" size={28} color={colors.iconMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          <Card style={styles.card}>
            <SectionTitle title="Location" />
            <View style={styles.locationBox}>
              <Ionicons name="navigate-outline" size={26} color={colors.success} />
              <View style={styles.locationTextBlock}>
                <Text style={styles.locationTitle}>Grand Auditorium</Text>
                <Text style={styles.locationText}>{selectedSession.place}</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function getSessionDetails(session) {
  return {
    ...session,
    status: session.sessionStatus || session.status,
    speakerDetails: session.speakerDetails || [],
  };
}

function getStatusStyle(status) {
  if (status === "LIVE") {
    return {
      bg: "#FFEDEA",
      color: colors.primary,
    };
  }

  return {
    bg: "#EAF4FF",
    color: "#1A73E8",
  };
}

function getAvatarColor(initials = "") {
  const colorsByInitial = {
    A: "#FFEDEA",
    R: colors.successLight,
    J: "#F4EDFF",
    N: "#EAF4FF",
    D: "#FFF3EF",
    P: "#F4EDFF",
    V: colors.successLight,
    M: "#FFEDEA",
  };

  return colorsByInitial[initials.charAt(0)] || colors.primaryLight;
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={22} color={colors.success} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
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
  topIconButton: {
    width: 42,
    height: 42,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.48)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  sessionHeroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  sessionHeroRowCompact: {
    gap: spacing.md,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  trackBadge: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  trackText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },
  liveBadge: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FFEDEA",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "900",
  },
  sessionTitle: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "900",
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -48,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 22,
  },
  infoCard: {
    borderRadius: 18,
    padding: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    marginBottom: 14,
  },
  bodyText: {
    color: "#5F5556",
    fontSize: 15,
    lineHeight: 23,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  speakersList: {
    gap: spacing.md,
  },
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  speakerInfo: {
    flex: 1,
    minWidth: 0,
  },
  speakerBadge: {
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: "#FFEDEA",
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 5,
  },
  speakerBadgeText: {
    color: colors.primary,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  speakerName: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  speakerRole: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  speakerCompany: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  speakerArrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successLight,
    borderRadius: 18,
    padding: 16,
  },
  locationTextBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  locationTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  locationText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
