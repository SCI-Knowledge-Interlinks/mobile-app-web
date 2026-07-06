import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuthButton from "../components/AuthButton";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";

function splitCompanyLines(company = "") {
  return String(company)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function MyBadgeScreen({
  badge = null,
  isLoading = false,
  onBack,
  onOpenCameraScanner,
}) {
  const insets = useSafeAreaInsets();

  const companyLines = useMemo(
    () => splitCompanyLines(badge?.company),
    [badge?.company]
  );

  const qrCodeUrl = useMemo(() => {
    if (!badge?.qrPayload) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      badge.qrPayload
    )}`;
  }, [badge?.qrPayload]);

  return (
    <View style={commonStyles.newScreenAlt}>
      <ScreenPageHeader title="My Badge" onBack={onBack} backgroundColor={colors.pageBackgroundAlt} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.brandBlue} />
            <Text style={styles.helperText}>Loading badge...</Text>
          </View>
        ) : badge ? (
          <View style={styles.card}>
            <Text style={styles.name}>{badge.fullName}</Text>

            {companyLines.map((line) => (
              <Text key={line} style={styles.company}>
                {line}
              </Text>
            ))}

            {!!badge.designation && (
              <Text style={styles.designation}>{badge.designation}</Text>
            )}

            {!!qrCodeUrl && (
              <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} resizeMode="contain" />
            )}

            <Text style={styles.regId}>{badge.regId}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No badge loaded yet</Text>
            <Text style={styles.helperText}>
              Scan the registration QR from your confirmation details. The QR contains your REG-ID
              (for example, PWS-OPE-0001).
            </Text>
          </View>
        )}

        {/* <View style={styles.actions}>
          <AuthButton title="Scan with Camera" onPress={() => onOpenCameraScanner?.()} />
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  loadingWrap: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + 4,
    alignItems: "center",
    ...commonStyles.cardShadowMd,
    gap: spacing.xs,
  },
  name: {
    ...textPresets.profileName,
    color: colors.black,
    textAlign: "center",
    textTransform: "uppercase",
  },
  company: {
    ...textPresets.infoBody,
    color: colors.black,
    textAlign: "center",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  designation: {
    ...textPresets.bodyMedium,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg - 4,
  },
  qrCode: {
    width: 220,
    height: 220,
    marginTop: spacing.sm + 2,
  },
  regId: {
    ...textPresets.profileName,
    color: colors.black,
    textAlign: "center",
    marginTop: spacing.sm,
    textTransform: "uppercase",
  },
  emptyState: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: "center",
    ...commonStyles.cardShadowMd,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...textPresets.sectionTitle,
    color: colors.text,
    textAlign: "center",
  },
  helperText: {
    ...textPresets.bodyMedium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 360,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
