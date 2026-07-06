import React from "react";
import { router } from "expo-router";

import SignInEmail from "../src/screens/SignInEmail";

export default function SignInEmailRoute() {
  return <SignInEmail onBack={() => router.back()} />;
}
