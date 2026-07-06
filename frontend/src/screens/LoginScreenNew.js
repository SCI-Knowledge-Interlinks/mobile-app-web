import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthMethodCard } from "../components/AuthButton";
import { colors } from "../constants/colors";
import { fontFamily } from "../constants/typography";
import { useTopSafeInset } from "../hooks/useTopSafeInset";
import { requestNotificationPermission } from "../hooks/usePushNotifications";

const LOGO_ROW_GAP = 8;
const APP_LOGO_SHARE = 0.55;
const BOCI_LOGO_SHARE = 0.45;
const APP_LOGO_ASPECT = 192 / 59;
const BOCI_LOGO_ASPECT = 2.8;

const assets = {
  appLogo: require("../assets/app_logo.png"),
  bociLogo: require("../assets/boci-dark.png"),
};

export default function LoginScreenNew({
  showBack = false,
  onBack,
  onSelectMobile,
  onSelectEmail,
  onSignUp,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = useTopSafeInset();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 400);
  const rowInnerWidth = contentWidth - LOGO_ROW_GAP;
  const appLogoWidth = rowInnerWidth * APP_LOGO_SHARE;
  const appLogoHeight = appLogoWidth / APP_LOGO_ASPECT;
  const bociLogoWidth = rowInnerWidth * BOCI_LOGO_SHARE;
  const bociLogoHeight = bociLogoWidth / BOCI_LOGO_ASPECT;

  useEffect(() => {
    // Ask on the first screen so permission is ready before login completes.
    requestNotificationPermission();
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: topInset, paddingBottom: insets.bottom }]}>
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      ) : null}

      <View style={[styles.logoRow, { width: contentWidth }]}>
        <Image
          source={assets.appLogo}
          style={{ width: appLogoWidth, height: appLogoHeight }}
          resizeMode="contain"
        />
        <Image
          source={assets.bociLogo}
          style={{ width: bociLogoWidth, height: bociLogoHeight }}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainContent, { width: contentWidth }]}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Welcome Back</Text>
           
            <Text style={styles.subtitle}>Choose a method to sign in to your account.</Text>

          </View>

          <View style={styles.methodList}>
            <AuthMethodCard
              icon="phone-portrait-outline"
              title="Continue with Mobile"
              subtitle="Password or OTP to your mobile"
              onPress={() => onSelectMobile?.() ?? router.push("/sign-in-mobile")}
            />
            <AuthMethodCard
              icon="mail-outline"
              title="Continue with Email Address"
              subtitle="Password or OTP to your email"
              onPress={() => onSelectEmail?.() ?? router.push("/sign-in-email")}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => onSignUp?.()}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 12,
    marginTop: 4,
    padding: 4,
  },
  logoRow: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: LOGO_ROW_GAP,
    marginTop:80,
  },
  mainScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  mainContent: {
    alignSelf: "center",
    gap: 28,
  },
  titleBlock: {
    alignItems: "center",
  //  width: "100%",
    gap: 10,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  methodList: {
    width: "100%",
    gap: 40,
  },
  footer: {
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footerLink: {
    color: colors.primaryBlue,
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
});
