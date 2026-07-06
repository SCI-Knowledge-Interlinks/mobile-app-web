import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../constants/colors";
import { fontFamily } from "../constants/typography";
import { useTopSafeInset } from "../hooks/useTopSafeInset";
import { registerPushAfterLogin } from "../hooks/usePushNotifications";

const SUCCESS_DELAY_MS = 1200;

function goToHome(router) {
  try {
    if (typeof router.dismissAll === "function") {
      router.dismissAll();
    }
  } catch {
    // Ignore if there is nothing to dismiss.
  }

  router.replace("/home-new");
}

export default function LoginSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = useTopSafeInset();
  const finishedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function finishLogin() {
      // Permission is requested on the login screen; register FCM token now that JWT exists.
      await registerPushAfterLogin();

      if (cancelled || finishedRef.current) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, SUCCESS_DELAY_MS));

      if (cancelled || finishedRef.current) {
        return;
      }

      finishedRef.current = true;
      goToHome(router);
    }

    finishLogin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: topInset, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={48} color={colors.success} />
        </View>

        <Text style={styles.title}>Signed In Successfully!</Text>
        <Text style={styles.subtitle}>Welcome back to your account.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EAF6ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});
