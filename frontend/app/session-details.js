import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import SessionDetails from "../src/screens/SessionDetails";

export default function SessionDetailsRoute() {
  const params = useLocalSearchParams();
  const selectedSession = getSessionFromParams(params.session);

  if (!selectedSession) {
    router.replace("/home");
    return null;
  }

  return (
    <SessionDetails
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
