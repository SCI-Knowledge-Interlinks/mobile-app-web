import React from "react";
import { router } from "expo-router";

import SignInMobile from "../src/screens/SignInMobile";

export default function SignInMobileRoute() {
  return <SignInMobile onBack={() => router.back()} />;
}
