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

import { Card, Header, NoDataCard } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { getAttendeesList } from "../services/attendeeService";

export default function Networking({ onOpenSpeakerInfo }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const [searchText, setSearchText] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [bookmarkedAttendeeIds, setBookmarkedAttendeeIds] = useState([]);

  const visibleAttendees = attendees.filter((attendee) => {
    const cleanSearch = searchText.trim().toLowerCase();
    if (!cleanSearch) return true;

    return [attendee.name, attendee.role, attendee.company]
      .join(" ")
      .toLowerCase()
      .includes(cleanSearch);
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAttendees() {
      try {
        const apiAttendees = await getAttendeesList();
        if (isMounted) {
          setAttendees(apiAttendees);
        }
      } catch (error) {
        console.log("Attendees list API failed:", error.message);
        if (isMounted) {
          setAttendees([]);
        }
      }
    }

    loadAttendees();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleBookmark = (attendeeId) => {
    setBookmarkedAttendeeIds((currentIds) =>
      currentIds.includes(attendeeId)
        ? currentIds.filter((id) => id !== attendeeId)
        : [...currentIds, attendeeId]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Header
          title="Networking"
          contentWidth={contentWidth}
          rightContent={
            <View style={styles.headerActions}>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
                <MaterialIcons name="notifications-none" size={23} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
                <MaterialIcons name="chat" size={23} color={colors.white} />
              </TouchableOpacity>
            </View>
          }
        >
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={25} color="#4D4D55" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by name, designation or company"
                placeholderTextColor="#8E8E99"
                style={styles.searchInput}
              />
              {searchText ? (
                <TouchableOpacity activeOpacity={0.8} onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={25} color="#B6B7BE" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Attendees</Text>
              <Text style={styles.countNumber}>{visibleAttendees.length}</Text>
            </View>
          </View>
        </Header>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          {visibleAttendees.length > 0 ? (
            <Card style={styles.listCard}>
              {visibleAttendees.map((attendee, index) => {
                const isBookmarked = bookmarkedAttendeeIds.includes(attendee.id);

                return (
                  <TouchableOpacity
                    key={attendee.id}
                    activeOpacity={0.84}
                    onPress={() => onOpenSpeakerInfo?.({ speaker: attendee })}
                    style={[
                      styles.attendeeRow,
                      index < visibleAttendees.length - 1 && styles.attendeeRowBorder,
                    ]}
                  >
                    <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                      <Text style={styles.avatarText}>{attendee.initials}</Text>
                    </View>

                    <View style={styles.attendeeInfo}>
                      <Text numberOfLines={1} style={styles.attendeeName}>
                        {attendee.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.attendeeRole}>
                        {attendee.role}
                      </Text>
                      <Text numberOfLines={1} style={styles.attendeeCompany}>
                        {attendee.company}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleBookmark(attendee.id);
                      }}
                      style={styles.bookmarkButton}
                    >
                      <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={25}
                        color={isBookmarked ? colors.primary : colors.muted}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </Card>
          ) : (
            <NoDataCard icon="people-outline" />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getAvatarColor(index) {
  const avatarColors = [
    colors.successLight,
    "#EAF4FF",
    "#FFF3EF",
    "#E7F6EF",
    "#F4EDFF",
    "#E6F1FA",
    "#F2EFEA",
    "#FFF0DA",
    "#FFE5EA",
    "#EAF4FF",
  ];

  return avatarColors[index % avatarColors.length];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 6,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E5E1",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 10,
  },
  countBox: {
    width: 92,
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countLabel: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
  },
  countNumber: {
    color: colors.white,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900",
    marginTop: 1,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -44,
  },
  listCard: {
    borderRadius: 18,
    padding: 0,
    overflow: "hidden",
  },
  attendeeRow: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  attendeeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  avatarText: {
    color: colors.success,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },
  attendeeInfo: {
    flex: 1,
    minWidth: 0,
  },
  attendeeName: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    marginBottom: 4,
  },
  attendeeRole: {
    color: colors.success,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    marginBottom: 4,
  },
  attendeeCompany: {
    color: "#565863",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 10,
  },
});
