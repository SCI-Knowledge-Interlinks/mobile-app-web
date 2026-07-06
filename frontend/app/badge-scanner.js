import React, { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import BadgeScannerScreen from "../src/screens/BadgeScannerScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { clearAuthSession } from "../src/services/sessionService";
import { loadUserFromSessionOrParams } from "../src/services/userService";
import { getApiErrorMessage, isNoInternetError } from "../src/utils/network";
import { getUserLookupFromParams } from "../src/utils/routeParams";
import { mapUser } from "../src/utils/userMapper";

export default function BadgeScannerRoute() {
  const params = useLocalSearchParams();
  const lookup = getUserLookupFromParams(params);
  const [user, setUser] = useState(() => mapUser({}, lookup.email));
  const [showNoInternet, setShowNoInternet] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setIsRetrying(true);
      const latestUser = await loadUserFromSessionOrParams(lookup);

      if (!latestUser) {
        router.replace("/");
        return;
      }

      setUser(mapUser(latestUser, lookup.email));
      setShowNoInternet(false);
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      await clearAuthSession();
      console.error("Badge scanner load failed:", getApiErrorMessage(error));
      router.replace("/");
    } finally {
      setIsRetrying(false);
    }
  }, [lookup.email, lookup.mobileNumber]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleBadgeScanned = useCallback(async () => {
    setIsProcessing(true);
    router.replace("/my-badge");
  }, []);

  if (showNoInternet) {
    return <NoInternetScreen onRetry={loadUser} isRetrying={isRetrying} />;
  }

  return (
    <BadgeScannerScreen
      user={user}
      isProcessing={isProcessing}
      onBack={() => router.back()}
      onBadgeScanned={handleBadgeScanned}
    />
  );
}
