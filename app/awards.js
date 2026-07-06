import React from "react";
import { router } from "expo-router";

import AwardsScreen from "../src/screens/AwardsScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getAwards } from "../src/services/eventService";

export default function AwardsRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(() => getAwards(), []);

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  const content = Array.isArray(data) && data.length > 0 ? data[0] : null;

  return (
    <AwardsScreen content={content} isLoading={isLoading} onBack={() => router.back()} />
  );
}
