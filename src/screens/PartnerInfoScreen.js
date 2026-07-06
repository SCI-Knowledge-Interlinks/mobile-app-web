import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InfoDetailCard, { InfoLogoImage, InfoLogoText } from "../components/InfoDetailCard";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { resolveMediaUrl } from "../utils/mediaUrl";

const PARTNER_LOGOS = {
  tata: require("../assets/partner1.png"),
  redbus: require("../assets/partner_redbus.png"),
  volvo: require("../assets/partner_volvo.png"),
  eicher: require("../assets/partner_eicher.png"),
};

const DEFAULT_BODY =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

export default function PartnerInfoScreen({ data, onBack }) {
  const insets = useSafeAreaInsets();
  const partner = normalizePartner(data);

  return (
    <View style={styles.screen}>
      <ScreenPageHeader title="Partner Event" onBack={onBack} backgroundColor="#F4F7FB" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <InfoDetailCard
          badge={partner.title}
          heading="LOREM IPSUM IS SIMPLY DUMMY TEXT OF THE PRINTING AND TYPESETTING INDUSTRY"
          body={partner.description || DEFAULT_BODY}
          topContent={
            partner.image ? (
              <InfoLogoImage source={partner.image} style={styles.partnerLogo} />
            ) : (
              <InfoLogoText>{partner.label || "partner"}</InfoLogoText>
            )
          }
        />
      </ScrollView>
    </View>
  );
}

function normalizePartner(data) {
  const item = data?.partner || data || {};
  const logoUrl = resolveMediaUrl(item.logo || item.logoUrl || item.imageUrl || item.image);

  return {
    id: item.id || "",
    title: item.title || "Partner",
    label: item.label || "",
    description: item.description || item.details || "",
    image: logoUrl ? { uri: logoUrl } : PARTNER_LOGOS[item.logoKey] || null,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  partnerLogo: {
    width: 200,
    height: 64,
  },
});
