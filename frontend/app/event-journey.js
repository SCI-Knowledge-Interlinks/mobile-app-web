import React from "react";
import { router } from "expo-router";

import EventJourneyScreen from "../src/screens/EventJourneyScreen";

export default function EventJourneyRoute() {
  return <EventJourneyScreen onBack={() => router.back()} />;
}
