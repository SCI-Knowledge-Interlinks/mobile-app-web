import React from "react";
import { router } from "expo-router";

import BociPartnerScreen from "../src/screens/BociPartnerScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getBociContent } from "../src/services/eventService";

export default function BociPartnerRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(
    () => getBociContent(),
    []
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  return (
    <BociPartnerScreen content={data} isLoading={isLoading} onBack={() => router.back()} />
  );
}
