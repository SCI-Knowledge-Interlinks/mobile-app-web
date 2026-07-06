import React from "react";
import { router } from "expo-router";

import ConferenceListScreen from "../src/screens/ConferenceListScreen";

export default function ConferenceListRoute() {
  return (
    <ConferenceListScreen
      onBack={() => router.back()}
      onOpenSessionDetails={(session) =>
        router.push({
          pathname: "/session-details-new",
          params: { session: JSON.stringify(session) },
        })
      }
      onOpenSpeakerProfile={(speaker) =>
        router.push({
          pathname: "/speaker-info",
          params: { data: JSON.stringify({ speaker }) },
        })
      }
    />
  );
}
