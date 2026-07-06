import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppStatusBar from "../components/AppStatusBar";
import ActionButton from "../components/ActionButton";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles, scrollBottomPadding } from "../styles/commonStyles";
import { formatUserFullName, getSafeText } from "../utils/userMapper";

export default function MyProfileScreen({ user = {}, onDeleteAccount, onLogout }) {
  const insets = useSafeAreaInsets();
  const savedImage = getSafeText(user.profileImageUrl);
  const [profileImage, setProfileImage] = useState(savedImage);

  useEffect(() => {
    setProfileImage(savedImage);
  }, [savedImage]);

  const name = formatUserFullName(user) || "Profile";
  const company = getSafeText(user.company);
  const designation = getSafeText(user.designation);
  const email = getSafeText(user.email);
  const mobile = getSafeText(user.mobile);
  const initials = getInitials(name);

  const handleDeleteAccount = () => {
    if (onDeleteAccount) {
      onDeleteAccount();
      return;
    }

    Alert.alert(
      "Delete Account",
      "Account deletion is not available yet. Please contact support."
    );
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    Alert.alert("Logout", "Logout is not available yet.");
  };

  return (
    <View style={commonStyles.newScreenAlt}>
      <AppStatusBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: spacing.sm + 2, paddingBottom: scrollBottomPadding(insets) },
        ]}
      >
        <Text style={styles.pageTitle}>My profile</Text>

        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <Text style={styles.name}>{name}</Text>
              {!!company && <Text style={styles.company}>{company}</Text>}
              {!!designation && <Text style={styles.designation}>{designation}</Text>}
            </View>

            <Text style={styles.infoTitle}>Info</Text>
            <View style={styles.infoBox}>
              {!!email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color={colors.profileBlue} />
                  <Text style={styles.infoText}>{email}</Text>
                </View>
              )}
              {!!mobile && (
                <View style={styles.infoRow}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.profileBlue} />
                  <Text style={styles.infoText}>{mobile}</Text>
                </View>
              )}
              {!email && !mobile && (
                <Text style={styles.infoEmpty}>No contact details available.</Text>
              )}
            </View>

            <View style={styles.actionRow}>
              <ActionButton
                title="Delete Account"
                color="profile"
                onPress={handleDeleteAccount}
              />
              <ActionButton title="Logout" color="profile" onPress={handleLogout} />
            </View>
          </View>

          <View style={styles.avatarRing} pointerEvents="none">
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
                resizeMode="cover"
                onError={() => setProfileImage("")}
              />
            ) : (
              <Text style={styles.avatarInitials}>{initials}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getInitials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg - 4,
    alignItems: "center",
  },
  pageTitle: {
    ...textPresets.pageHeaderTitleLeft,
    color: colors.text,
    marginBottom: spacing.lg + 4,
    alignSelf: "center",
  },
  cardWrap: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    paddingTop: 48,
  },
  avatarRing: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    zIndex: 20,
    elevation: 12,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontFamily: textPresets.profileName.fontFamily,
    fontSize: 32,
    color: "#4A4A4A",
  },
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 60,
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: spacing.lg + 4,
    ...commonStyles.cardShadowMd,
    elevation: 3,
    zIndex: 1,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    ...textPresets.infoHeading,
    color: colors.profileBlue,
    textAlign: "center",
  },
  company: {
    ...textPresets.infoBody,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  designation: {
    ...textPresets.labelCondensed,
    fontFamily: textPresets.pageHeaderTitle.fontFamily,
    fontSize: 13,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  infoTitle: {
    ...textPresets.bodyMedium,
    fontFamily: textPresets.pageHeaderTitle.fontFamily,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoBox: {
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm + 2,
    marginBottom: spacing.lg + 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  infoText: {
    flex: 1,
    ...textPresets.infoBody,
    color: colors.text,
  },
  infoEmpty: {
    ...textPresets.infoBody,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
