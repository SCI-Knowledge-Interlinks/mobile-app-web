import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import ResetPasswordScreen from "../src/screens/ResetPasswordScreen";

function getParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ResetPasswordRoute() {
  const params = useLocalSearchParams();

  return (
    <ResetPasswordScreen
      email={getParam(params.email) || ""}
      requestId={getParam(params.requestId) || ""}
      code={getParam(params.code) || ""}
      otp={getParam(params.otp) || ""}
      onBack={() => router.back()}
    />
  );
}
