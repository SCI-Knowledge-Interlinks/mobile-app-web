import React from "react";
import { router } from "expo-router";

import FloorPlanScreen from "../src/screens/FloorPlanScreen";

export default function FloorPlanRoute() {
  return <FloorPlanScreen onBack={() => router.back()} />;
}
