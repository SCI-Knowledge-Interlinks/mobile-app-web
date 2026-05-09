import React, { useEffect, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
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
import { getSpeakersList } from "../services/speakerService";

export default function Speakers({ onBack, onOpenSpeakerInfo }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 28, 760), [width]);
  const [searchText, setSearchText] = useState("");
  const [speakers, setSpeakers] = useState([]);
  const [bookmarkedSpeakerIds, setBookmarkedSpeakerIds] = useState([]);

  const visibleSpeakers = speakers.filter((speaker) => {
    const cleanSearch = searchText.trim().toLowerCase();
    if (!cleanSearch) return true;

    return [speaker.name, speaker.role, speaker.company]
      .join(" ")
      .toLowerCase()
      .includes(cleanSearch);
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSpeakers() {
      try {
        const apiSpeakers = await getSpeakersList();
        if (isMounted) {
          setSpeakers(apiSpeakers);
        }
      } catch (error) {
        console.log("Speakers list API failed:", error.message);
        if (isMounted) {
          setSpeakers([]);
        }
      }
    }

    loadSpeakers();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleBookmark = (speakerId) => {
    setBookmarkedSpeakerIds((currentIds) =>
      currentIds.includes(speakerId)
        ? currentIds.filter((id) => id !== speakerId)
        : [...currentIds, speakerId]
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
        <Header title="Speakers" onBack={onBack} contentWidth={contentWidth}>
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
          </View>
          <Text style={styles.countLabel}>Total Count({visibleSpeakers.length})</Text>
        </Header>
 
        <View style={[styles.content, { maxWidth: contentWidth }]}>
          {visibleSpeakers.length > 0 ? (
            <Card style={styles.listCard}>
              {visibleSpeakers.map((speaker, index) => {
                const isBookmarked = bookmarkedSpeakerIds.includes(speaker.id);

                return (
                  <TouchableOpacity
                    key={speaker.id}
                    activeOpacity={0.84}
                    onPress={() => onOpenSpeakerInfo?.({ speaker })}
                    style={[
                      styles.speakerRow,
                      index < visibleSpeakers.length - 1 && styles.speakerRowBorder,
                    ]}
                  >
                    <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                      <Text style={styles.avatarText}>{speaker.initials}</Text>
                    </View>

                    <View style={styles.speakerInfo}>
                      <Text numberOfLines={1} style={styles.speakerName}>
                        {speaker.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.speakerRole}>
                        {speaker.role}
                      </Text>
                      <Text numberOfLines={1} style={styles.speakerCompany}>
                        {speaker.company}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleBookmark(speaker.id);
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
  content: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    marginTop: -44,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 10,
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
    paddingHorizontal: 22,
     gap: 14,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 10,
    marginLeft: 12,
  },
  
  countLabel: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
     paddingHorizontal: 14,
     marginTop: 15,
  },
  listCard: {
    borderRadius: 18,
    padding: 0,
    overflow: "hidden",
  },
  speakerRow: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  speakerRowBorder: {
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
  speakerInfo: {
    flex: 1,
    minWidth: 0,
  },
  speakerName: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    marginBottom: 4,
  },
  speakerRole: {
    color: colors.success,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    marginBottom: 4,
  },
  speakerCompany: {
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
