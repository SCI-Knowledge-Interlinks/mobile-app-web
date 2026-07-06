import React from "react";
import { router } from "expo-router";

import ContactUsScreen from "../src/screens/ContactUsScreen";

export default function ContactUsRoute() {
  return <ContactUsScreen onBack={() => router.back()} />;
}
