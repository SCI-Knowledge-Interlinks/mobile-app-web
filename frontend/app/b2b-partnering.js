import React from "react";
import { router } from "expo-router";

import B2BPartneringScreen from "../src/screens/B2BPartneringScreen";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getB2BPartnering } from "../src/services/eventService";

export default function B2BPartneringRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(
    () => getB2BPartnering(),
    []
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  return (
    <B2BPartneringScreen content={data} isLoading={isLoading} onBack={() => router.back()} />
  );
}
