import React, { useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Alert,
  Modal,
  Platform,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Header } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";

export default function SpeakerInfo({ data, onBack }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const speaker = getSpeakerInfo(data);
  const sessions = speaker.sessions;
  const [bookmarkedSessionIds, setBookmarkedSessionIds] = useState(() =>
    getInitialBookmarkedSessionIds(sessions, data?.session)
  );
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageText, setMessageText] = useState("");
  const hasBookmarkedSession = bookmarkedSessionIds.length > 0;
  const shareMessage = `${speaker.name}\n${speaker.role}\n${speaker.company}`;

  const toggleSessionBookmark = (sessionId) => {
    if (!sessionId) return;

    setBookmarkedSessionIds((currentIds) =>
      currentIds.includes(sessionId)
        ? currentIds.filter((id) => id !== sessionId)
        : [...currentIds, sessionId]
    );
  };

  const shareSpeaker = async () => {
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: speaker.name, text: shareMessage });
          return;
        }

        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareMessage);
          Alert.alert("Copied", "Speaker details copied to clipboard.");
        }
        return;
      }

      await Share.share({
        title: speaker.name,
        message: shareMessage,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        Alert.alert("Share", "Could not share this speaker right now.");
      }
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        <Header
          title="Profile"
          onBack={onBack}
          contentWidth={contentWidth}
          rightContent={
            <View style={styles.topActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleSessionBookmark(sessions[0]?.id)}
                style={styles.topIconButton}
              >
                <Ionicons
                  name={hasBookmarkedSession ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={shareSpeaker} style={styles.topIconButton}>
                <Ionicons name="share-social-outline" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          }
        >
          <View style={styles.profileBlock}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{speaker.initials}</Text>
              </View>
            </View>

            <Text style={styles.name}>{speaker.name}</Text>
            <Text style={styles.role}>{speaker.role}</Text>
            <Text style={styles.company}>{speaker.company}</Text>
          </View>
        </Header>

        <View style={[styles.mainContent, { maxWidth: contentWidth }]}>
          <Card style={styles.aboutCard}>
            <SectionTitle title="About" />
            <Text style={styles.aboutText}>{speaker.about}</Text>
          </Card>

          {sessions.length > 0 ? (
            <Card style={styles.sessionsCard}>
              <SectionTitle title="Sessions" />
              <View style={styles.sessionList}>
                {sessions.map((session) => {
                  const isBookmarked = bookmarkedSessionIds.includes(session.id);

                  return (
                    <View key={session.id || session.title} style={styles.sessionCard}>
                      <View style={styles.sessionDateBox}>
                        <Text style={styles.sessionDateDay}>{session.dateDay}</Text>
                        <Text style={styles.sessionDateMonth}>{session.dateMonth}</Text>
                      </View>

                      <View style={styles.sessionInfo}>
                        <View style={styles.trackBadge}>
                          <Text style={styles.trackText}>{session.track}</Text>
                        </View>
                        <View style={styles.sessionTitleRow}>
                          <Text numberOfLines={2} style={styles.sessionTitle}>
                            {session.title}
                          </Text>
                        </View>

                        <View style={styles.sessionMetaRow}>
                          <Ionicons name="time-outline" size={14} color={colors.muted} />
                          <Text style={styles.sessionMetaText}>{session.time}</Text>
                        </View>

                        <View style={styles.sessionMetaRow}>
                          <Ionicons name="location-outline" size={14} color={colors.muted} />
                          <Text style={styles.sessionMetaText}>{session.place}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleSessionBookmark(session.id)}
                        style={styles.bookmarkButton}
                      >
                        <Ionicons
                          name={isBookmarked ? "bookmark" : "bookmark-outline"}
                          size={22}
                          color={isBookmarked ? colors.primary : "#4D3F3D"}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}

          <Card style={styles.expertiseCard}>
            <SectionTitle title="Expertise" />
            
            <View style={styles.expertiseWrap}>
              {speaker.expertise.map((item) => (
                <View key={item} style={styles.expertiseChip}>
                  <Text style={styles.expertiseText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
        <View style={[styles.bottomInner, { maxWidth: contentWidth }]}>
          <Button
            title="Message"
            onPress={() => setShowMessagePopup(true)}
            style={styles.bottomButton}
          />
          <Button title="Schedule 1-2-1" style={styles.bottomButton} />
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showMessagePopup}
        onRequestClose={() => setShowMessagePopup(false)}
      >
        <View style={styles.popupOverlay}>
          <Card style={styles.popupCard}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Enter your message</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowMessagePopup(false)}
                style={styles.popupCloseButton}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type here"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={styles.messageInput}
            />

            <Button
              title="Connect"
              onPress={() => setShowMessagePopup(false)}
              style={styles.connectButton}
            />
          </Card>
        </View>
      </Modal>
    </View>
  );
}
function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}
function getSpeakerInfo(data = {}) {
  const speaker = data.speaker || {};
  const mappedSessions = Array.isArray(speaker.sessions) ? speaker.sessions : [];
  const fallbackSessions = data.session ? [data.session] : [];
  const sessions = (mappedSessions.length > 0 ? mappedSessions : fallbackSessions).map(getSessionInfo);
  const defaultExpertise = [
    "Urban Mobility",
    "Smart Cities",
    "Sustainability",
    "AI & Data",
    "Policy & Governance",
  ];

  return {
    name: speaker.name || "Speaker",
    role: speaker.role || "Mobility Expert",
    company: speaker.company || "Prawaas",
    initials: speaker.initials || getInitials(speaker.name),
    about:
      speaker.about ||
      `${speaker.name || "This speaker"} brings practical experience in public mobility, transit operations, and future-ready transport planning for growing cities.`,
    expertise: speaker.expertise?.length ? speaker.expertise : defaultExpertise,
    sessions,
  };
}

function getInitialBookmarkedSessionIds(sessions, selectedSession) {
  const bookmarkedIds = sessions
    .filter((session) => session.isBookmarked)
    .map((session) => session.id);

  if (selectedSession?.isBookmarked && selectedSession.id) {
    bookmarkedIds.push(selectedSession.id);
  }

  return [...new Set(bookmarkedIds)];
}

function getSessionInfo(session) {
  const dateParts = String(session.date || "").split(" ");

  return {
    id: session.id,
    title: session.title,
    time: session.time,
    place: session.place,
    track: session.track,
    isBookmarked: Boolean(session.isBookmarked),
    dateDay: dateParts[0] || "09",
    dateMonth: dateParts[1] || "JUL",
  };
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  profileBlock: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginTop:15,
  },
  avatarOuter: {
    width: 70,
    height: 70,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  avatar: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: "#DDEFE4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.success,
    fontSize: 34,
    fontWeight: "900",
  },
  name: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center",
  },
  role: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  company: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 2,
  },
  mainContent: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -44,
    gap: 12,
  },
  aboutCard: {
    borderRadius: 18,
    padding: 20,
  },
  sessionsCard: {
    borderRadius: 18,
    padding: 20,
  },
  expertiseCard: {
    borderRadius: 18,
    padding: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    marginBottom: 14,
  },
  aboutText: {
    color: "#5F5556",
    fontSize: 15,
    lineHeight: 24,
  },
  sessionList: {
    gap: spacing.sm,
  },
  sessionCard: {
    borderRadius: 16,
    // padding: 5,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sessionDateBox: {
    width: 58,
    height: 68,
    borderRadius: 10,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sessionDateDay: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
  },
  sessionDateMonth: {
    color: "#4D3F3D",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },
  sessionTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  sessionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  trackBadge: {
     alignSelf: "flex-start",
    borderRadius: 18,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  trackText: {
    color: colors.success,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
  },
  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 3,
  },
  sessionMetaText: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  bookmarkButton: {
    width: 34,
    height: 34,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginLeft: 8,
  },
  expertiseWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
  },
  expertiseChip: {
    borderRadius: 16,
    backgroundColor: "#F0F1F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  expertiseText: {
    color: "#3F3F46",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  bottomInner: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    borderRadius: 28,
    minHeight: 58,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  popupCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 20,
    padding: 20,
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  popupTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
  },
  popupCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F1F3",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  messageInput: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    backgroundColor: "#F8F8F8",
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  connectButton: {
    borderRadius: 14,
  },
});
