import React from "react";
import { router } from "expo-router";

import PartnersScreenNew from "../src/screens/PartnersScreenNew";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getPartners } from "../src/services/eventService";

export default function PartnersNewRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(
    () => getPartners(),
    []
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  return (
    <PartnersScreenNew
      partners={data || []}
      isLoading={isLoading}
      onBack={() => router.back()}
      onOpenPartnerInfo={(data) =>
        router.push({
          pathname: "/partner-info",
          params: { data: JSON.stringify(data) },
        })
      }
    />
  );
}
