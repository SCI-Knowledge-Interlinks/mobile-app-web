import React from "react";
import { router } from "expo-router";

import ExhibitorScreenNew from "../src/screens/ExhibitorScreenNew";
import NoInternetScreen from "../src/screens/NoInternetScreen";
import { useEventScreenData } from "../src/hooks/useEventScreenData";
import { getExhibitors } from "../src/services/eventService";

export default function ExhibitorNewRoute() {
  const { data, isLoading, showNoInternet, reload } = useEventScreenData(
    () => getExhibitors(),
    []
  );

  if (showNoInternet) {
    return <NoInternetScreen onRetry={reload} isRetrying={isLoading} />;
  }

  return (
    <ExhibitorScreenNew
      exhibitors={data || []}
      isLoading={isLoading}
      activeTab="exhibition"
      onBack={() => router.back()}
      onOpenExhibitorInfo={(data) =>
        router.push({
          pathname: "/exhibitor-info",
          params: { data: JSON.stringify(data) },
        })
      }
      onTabPress={(tab) => {
        if (tab === "exhibition") return;

        if (tab === "home") {
          router.replace("/home-new");
          return;
        }

        router.replace({
          pathname: "/home-new",
          params: { tab },
        });
      }}
    />
  );
}
