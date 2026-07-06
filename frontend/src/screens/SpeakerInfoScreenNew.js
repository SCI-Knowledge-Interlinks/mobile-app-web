import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActionButton from "../components/ActionButton";
import InfoDetailCard from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const speakerPlaceholder = require("../assets/speaker_placeholder.png");

const DEFAULT_BODY =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

export default function SpeakerInfoScreenNew({ data, onBack, onMessage, onSchedule }) {
  const insets = useSafeAreaInsets();
  const speaker = normalizeSpeaker(data);

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title="Speaker Info" onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        <InfoDetailCard
          heading="LOREM IPSUM IS SIMPLY DUMMY TEXT OF THE PRINTING AND TYPESETTING INDUSTRY"
          body={speaker.about || DEFAULT_BODY}
          topContent={
            <View style={styles.speakerTop}>
              <Image
                source={
                  speaker.imageUrl ? { uri: speaker.imageUrl } : speakerPlaceholder
                }
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.speakerMeta}>
                <Text style={styles.name}>{speaker.name}</Text>
                <Text style={styles.tagline}>
                  {speaker.role}
                  {speaker.company ? `, ${speaker.company}` : ""}
                </Text>
                <FontAwesome name="linkedin-square" size={22} color={colors.accentBlue} />
              </View>
            </View>
          }
        />

        {/* <View style={styles.actionsRow}>
          <ActionButton title="Message" onPress={() => onMessage?.(speaker)} />
          <ActionButton
            title="Schedule 1-2-1"
            onPress={() => onSchedule?.(speaker)}
          />
        </View> */}
      </ScrollView>
    </View>
  );
}

function normalizeSpeaker(data) {
  const speaker = data?.speaker || data || {};
  return {
    id: speaker.id || "",
    name: speaker.name || "Speaker",
    role: speaker.role || "Speaker",
    company: speaker.company || "",
    about: speaker.about || speaker.bio || "",
    imageUrl: speaker.imageUrl || "",
  };
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  speakerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 4,
    width: "100%",
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: colors.borderInput,
  },
  speakerMeta: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  name: {
    ...textPresets.infoHeading,
    color: colors.brandBlue,
  },
  tagline: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
});
