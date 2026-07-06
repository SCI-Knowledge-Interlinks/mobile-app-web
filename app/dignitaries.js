import React from "react";
import { router } from "expo-router";

import DignitariesScreen from "../src/screens/DignitariesScreen";

export default function DignitariesRoute() {
  return <DignitariesScreen onBack={() => router.back()} />;
}
