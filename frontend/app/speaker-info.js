import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import SpeakerInfo from "../src/screens/SpeakerInfo";

export default function SpeakerInfoRoute() {
  const params = useLocalSearchParams();
  const speakerData = getSpeakerDataFromParams(params.data);

  if (!speakerData) {
    router.back();
    return null;
  }

  return <SpeakerInfo data={speakerData} onBack={() => router.back()} />;
}

function getSpeakerDataFromParams(dataParam) {
  const value = Array.isArray(dataParam) ? dataParam[0] : dataParam;

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
