import React from "react";
import { router } from "expo-router";

import Speakers from "../src/screens/Speakers";

export default function SpeakersRoute() {
  return (
    <Speakers
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
