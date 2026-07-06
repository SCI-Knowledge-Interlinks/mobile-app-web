import React from "react";
import { router } from "expo-router";

import SpeakersNew from "../src/screens/SpeakersNew";

export default function SpeakersRoute() {
  return (
    <SpeakersNew
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
