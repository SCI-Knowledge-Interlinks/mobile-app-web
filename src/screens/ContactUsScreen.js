import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

const contacts = [
  {
    region: "Gujarat",
    name: "Pooja Kalamkar",
    email: "pooja.kalamkar@mmactiv.com",
    phone: "+91 8369 896 565",
  },
  {
    region: "Mumbai/Pune",
    name: "Denzil Dsouza",
    email: "denzil.dsouza@mmactiv.com",
    phone: "+91 9821 447 064",
  },
  {
    region: "Bengaluru",
    name: "Sneha Singh",
    email: "sneha.singh@mmactiv.com",
    phone: "+91 7676 268 577",
  },
  {
    region: "New Delhi",
    name: "Manas Das",
    email: "manas.das@mmactiv.com",
    phone: "+91 9899 208 916",
  },
  {
    region: "Hyderabad",
    name: "Yvln Murthy",
    email: "yvln.murthy@mmactiv.com",
    phone: "+91 9246 577 114",
  },
];

export default function ContactUsScreen({ onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={commonStyles.newScreenSoft}>
      <ScreenPageHeader title="Contact Us" onBack={onBack} centered={false} backgroundColor={colors.pageBackgroundSoft} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        {contacts.map((contact) => (
          <View key={contact.region} style={styles.card}>
            <Text style={styles.region}>{contact.region}</Text>
            <Text style={styles.detail}>{contact.name}</Text>
            <Text style={styles.detail}>{contact.email}</Text>
            <Text style={styles.detail}>{contact.phone}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm + 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    ...commonStyles.cardShadow,
    gap: spacing.xs,
  },
  region: {
    ...textPresets.sectionTitle,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  detail: {
    ...textPresets.infoBody,
    color: colors.textSubtle,
  },
});
