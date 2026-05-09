import React from "react";
import { router } from "expo-router";

import MyCalendar from "../src/screens/MyCalendar";

export default function MyCalendarRoute() {
  return <MyCalendar onBack={() => router.back()} />;
}
