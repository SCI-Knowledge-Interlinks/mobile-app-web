import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import SessionDetailsScreenNew from "../src/screens/SessionDetailsScreenNew";

export default function SessionDetailsNewRoute() {
  const params = useLocalSearchParams();
  const selectedSession = getSessionFromParams(params.session);

  if (!selectedSession) {
    router.back();
    return null;
  }

  return (
    <SessionDetailsScreenNew
      session={selectedSession}
      onBack={() => router.back()}
      onOpenSpeakerInfo={(data) =>
        router.push({
          pathname: "/speaker-info",
          params: { data: JSON.stringify(data) },
        })
      }
    />
  );
}

function getSessionFromParams(sessionParam) {
  const value = Array.isArray(sessionParam) ? sessionParam[0] : sessionParam;
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
