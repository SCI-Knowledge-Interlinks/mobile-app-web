import React, { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import MyBadgeScreen from "../src/screens/MyBadgeScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { fetchLinkedBadge } from "../src/services/badgeService";
import { getBadgeSession, saveBadgeSession } from "../src/services/badgeSessionService";
import { clearAuthSession } from "../src/services/sessionService";
import { loadUserFromSessionOrParams } from "../src/services/userService";
import { getApiErrorMessage, isNoInternetError } from "../src/utils/network";
import { getUserLookupFromParams } from "../src/utils/routeParams";
import { mapUser } from "../src/utils/userMapper";

export default function MyBadgeRoute() {
  const params = useLocalSearchParams();
  const lookup = getUserLookupFromParams(params);
  const [user, setUser] = useState(() => mapUser({}, lookup.email));
  const [badge, setBadge] = useState(null);
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isBadgeLoading, setIsBadgeLoading] = useState(true);

  const loadBadge = useCallback(async (currentUser) => {
    const cachedBadge = await getBadgeSession();
    if (cachedBadge) {
      setBadge(cachedBadge);
      return cachedBadge;
    }

    if (!currentUser?.id) {
      setBadge(null);
      return null;
    }

    try {
      const linkedBadge = await fetchLinkedBadge(currentUser.id);
      if (linkedBadge) {
        await saveBadgeSession(linkedBadge);
        setBadge(linkedBadge);
        return linkedBadge;
      }
    } catch (error) {
      if (isNoInternetError(error)) {
        throw error;
      }
    }

    setBadge(null);
    return null;
  }, []);

  const loadUser = useCallback(async () => {
    try {
      setIsRetrying(true);
      setIsBadgeLoading(true);

      const latestUser = await loadUserFromSessionOrParams(lookup);

      if (!latestUser) {
        router.replace("/");
        return;
      }

      const mappedUser = mapUser(latestUser, lookup.email);
      setUser(mappedUser);
      await loadBadge(mappedUser);
      setShowNoInternet(false);
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      await clearAuthSession();
      console.error("My Badge load failed:", getApiErrorMessage(error));
      router.replace("/");
    } finally {
      setIsRetrying(false);
      setIsBadgeLoading(false);
    }
  }, [loadBadge, lookup.email, lookup.mobileNumber]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={loadUser} isRetrying={isRetrying} />;
  }

  return (
    <MyBadgeScreen
      badge={badge}
      isLoading={isBadgeLoading}
      onBack={() => router.back()}
      onOpenCameraScanner={() => router.push("/badge-scanner")}
    />
  );
}
