import React, { useEffect, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ListSearchBar from "../components/ListSearchBar";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { getSpeakersList } from "../services/speakerService";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const speakerPlaceholder = require("../assets/speaker_placeholder.png");

export default function SpeakersNew({ onBack, onOpenSpeakerInfo }) {
  const insets = useSafeAreaInsets();
  const [speakers, setSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const visibleSpeakers = useMemo(
    () => speakers.filter((speaker) => matchesSpeakerSearch(speaker, searchText)),
    [speakers, searchText]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSpeakers() {
      try {
        setIsLoading(true);
        const apiSpeakers = await getSpeakersList();
        if (isMounted) {
          setSpeakers(apiSpeakers);
        }
      } catch (error) {
        console.log("Speakers list API failed:", error.message);
        if (isMounted) {
          setSpeakers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSpeakers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Speakers" onBack={onBack} />
      <ListSearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name, designation or company"
      />

<Text style={styles.countLabel}>Total Count({visibleSpeakers.length})</Text>
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
          {visibleSpeakers.length === 0 ? (
            <Text style={commonStyles.emptyState}>
              {searchText.trim() ? "No speakers match your search." : "No speakers found."}
            </Text>
          ) : (
            
            visibleSpeakers.map((speaker) => (
              <TouchableOpacity
                key={speaker.id}
                activeOpacity={0.85}
                onPress={() => onOpenSpeakerInfo?.({ speaker })}
                style={styles.row}
              >
                <Image
                  source={
                    speaker.imageUrl ? { uri: speaker.imageUrl } : speakerPlaceholder
                  }
                  style={styles.photo}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{speaker.name}</Text>
                  <Text style={styles.role}>{speaker.role}</Text>
                  <Text style={styles.meta}>{getSpeakerMeta(speaker)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.clearIcon} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function matchesSpeakerSearch(speaker, searchText) {
  const query = searchText.trim().toLowerCase();
  if (!query) return true;

  const sessionText = (speaker.sessions || [])
    .map((session) => [session.title, session.date].filter(Boolean).join(" "))
    .join(" ");

  return [speaker.name, speaker.role, speaker.company, sessionText, getSpeakerMeta(speaker)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function getSpeakerMeta(speaker) {
  const sessionLabels = (speaker.sessions || [])
    .map((session) => session.date || session.title)
    .filter(Boolean);

  if (sessionLabels.length > 0) {
    return sessionLabels.join(", ");
  }

  if (speaker.company) {
    return speaker.company;
  }

  return "Prawaas 2026";
}

const styles = StyleSheet.create({
  countLabel: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "800",
     paddingHorizontal: 14,
     marginTop: 15,
     marginBottom: 10,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.lg - 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.borderInput,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...textPresets.sectionTitle,
    fontSize: 16,
    color: colors.text,
  },
  role: {
    ...textPresets.infoBody,
    color: colors.brandBlue,
  },
  meta: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    color: colors.textSecondary,
  },
});
