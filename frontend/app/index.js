import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { router, useFocusEffect } from "expo-router";

import LoginScreenNew from "../src/screens/LoginScreenNew";
import SplashScreen, { SPLASH_MIN_DURATION_MS } from "../src/screens/SplashScreen";
import { getAuthSession } from "../src/services/sessionService";
import {
  hasCompletedInitialSplash,
  markInitialSplashComplete,
} from "../src/utils/splashSession";

const isWeb = Platform.OS === "web";

export default function IndexRoute() {
  const [showSplash, setShowSplash] = useState(() => !isWeb && !hasCompletedInitialSplash());
  const [ready, setReady] = useState(() => isWeb || hasCompletedInitialSplash());

  const redirectIfAuthenticated = useCallback(async () => {
    const session = await getAuthSession();
    if (session?.token) {
      router.replace("/home-new");
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (!isWeb && !hasCompletedInitialSplash()) {
        await new Promise((resolve) => {
          setTimeout(resolve, SPLASH_MIN_DURATION_MS);
        });
        markInitialSplashComplete();
        if (!mounted) return;
        setShowSplash(false);
      } else if (isWeb) {
        markInitialSplashComplete();
      }

      const redirected = await redirectIfAuthenticated();
      if (!mounted || redirected) return;

      setReady(true);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [redirectIfAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      redirectIfAuthenticated();
    }, [redirectIfAuthenticated])
  );

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!ready) {
    return null;
  }

  return <LoginScreenNew />;
}
