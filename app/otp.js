import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import OtpScreen from "../src/screens/OtpScreen";

function getParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default function OtpRoute() {
  const params = useLocalSearchParams();
  const channel = getParam(params.channel) || "mobile";
  const purpose = getParam(params.purpose) || "login_email_otp";

  return (
    <OtpScreen
      channel={channel}
      email={getParam(params.email) || ""}
      countryCode={getParam(params.countryCode) || "+91"}
      mobileNumber={getParam(params.mobileNumber) || ""}
      requestId={getParam(params.requestId) || ""}
      purpose={purpose}
      onBack={() => router.back()}
    />
  );
}
