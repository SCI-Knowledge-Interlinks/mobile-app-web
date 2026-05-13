import React from "react";
import { router } from "expo-router";

import Helpdesk from "../src/screens/Helpdesk";

export default function HelpdeskRoute() {
  return <Helpdesk onBack={() => router.back()} />;
}
