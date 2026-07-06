import React from "react";
import { router } from "expo-router";

import EventInfoScreen from "../src/screens/EventInfoScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getEventInfo } from "../src/services/eventService";

export default function EventInfoRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(() => getEventInfo(), []);

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  return <EventInfoScreen content={data} isLoading={isLoading} onBack={() => router.back()} />;
}
