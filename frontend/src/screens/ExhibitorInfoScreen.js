import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard, { InfoLogoImage, InfoLogoText } from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const EXHIBITOR_LOGOS = {
  boci: require("../assets/boci-dark.png"),
  partner1: require("../assets/partner1.png"),
};

export default function ExhibitorInfoScreen({ data, onBack }) {
  const insets = useSafeAreaInsets();
  const exhibitor = normalizeExhibitor(data);

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title="Exhibitor Info" onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        <InfoDetailCard
          heading="ABOUT EXHIBITOR"
          body={exhibitor.description}
          topContent={
            <>
              {exhibitor.logo ? (
                <InfoLogoImage source={exhibitor.logo} />
              ) : (
                <InfoLogoText>{exhibitor.name.toLowerCase()}</InfoLogoText>
              )}
              <Text style={styles.name}>{exhibitor.name}</Text>
              <Text style={styles.meta}>Booth No. {exhibitor.booth}</Text>
              <Text style={styles.meta}>Hall No. {exhibitor.hall}</Text>
            </>
          }
        />
      </ScrollView>
    </View>
  );
}

function normalizeExhibitor(data) {
  const item = data?.exhibitor || data || {};
  const logoUrl = item.logoUrl || "";

  return {
    id: item.id || "",
    name: item.name || "Exhibitor",
    booth: item.booth || "-",
    hall: item.hall || "-",
    description: item.description || item.companyName || item.role || "",
    logo: logoUrl ? { uri: logoUrl } : EXHIBITOR_LOGOS[item.logoKey] || null,
  };
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  name: {
    ...textPresets.profileName,
    color: colors.brandBlue,
    marginBottom: spacing.sm,
  },
  meta: {
    ...textPresets.infoBody,
    color: colors.textSecondary,
    marginBottom: 2,
  },
});
