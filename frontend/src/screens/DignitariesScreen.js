import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets, fontFamily } from "../constants/typography";
import { useAppContentWidth } from "../hooks/useAppContentWidth";
import { getDignitariesList } from "../services/dignitaryService";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const GRID_COLUMNS = 2;
const GRID_GAP = spacing.sm + 4;
const H_PADDING = spacing.md;
const CARD_IMAGE_HEIGHT = 140;

const dignitaryPlaceholder = require("../assets/speaker_placeholder.png");

export default function DignitariesScreen({ onBack }) {
  const insets = useSafeAreaInsets();
  const contentWidth = useAppContentWidth();
  const [dignitaries, setDignitaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cardWidth = useMemo(() => {
    const availableWidth = contentWidth - H_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1);
    return availableWidth / GRID_COLUMNS;
  }, [contentWidth]);

  useEffect(() => {
    let isMounted = true;

    async function loadDignitaries() {
      try {
        setIsLoading(true);
        const items = await getDignitariesList();
        if (isMounted) {
          setDignitaries(items);
        }
      } catch (error) {
        console.log("Dignitaries list API failed:", error.message);
        if (isMounted) {
          setDignitaries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDignitaries();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={commonStyles.newScreen}>
      <ScreenPageHeader title="Dignitaries" onBack={onBack} />
     

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
          {dignitaries.length === 0 ? (
            <Text style={commonStyles.emptyState}>No dignitaries found.</Text>
          ) : (
            <View style={styles.grid}>
              {dignitaries.map((dignitary, index) => (
                <View
                  key={dignitary.id}
                  style={[styles.card, { width: cardWidth }]}
                >
                  <Image
                    source={
                      dignitary.imageUrl
                        ? { uri: dignitary.imageUrl }
                        : dignitaryPlaceholder
                    }
                    style={styles.photo}
                    resizeMode="cover"
                  />
                  <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={2}>
                      {dignitary.name}
                    </Text>
                    {!!dignitary.role && (
                      <Text style={styles.role} numberOfLines={2}>
                        {dignitary.role}
                      </Text>
                    )}
                    {!!dignitary.company && (
                      <Text style={styles.company} numberOfLines={2}>
                        {dignitary.company}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
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
    paddingHorizontal: H_PADDING,
    paddingTop: spacing.xs,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: spacing.xs,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  photo: {
    width: "100%",
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.borderInput,
  },
  details: {
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    alignItems: "center",
  },
  name: {
    ...textPresets.sectionTitle,
    fontSize: 14,
    lineHeight: 18,
    color: colors.text,
    textAlign: "center",
    fontFamily: fontFamily.bold,
  },
  role: {
    ...textPresets.infoBody,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brandBlue,
    textAlign: "center",
  },
  company: {
    ...textPresets.caption,
    fontFamily: textPresets.body.fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
