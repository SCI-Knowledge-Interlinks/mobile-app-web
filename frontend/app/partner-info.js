import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import PartnerInfoScreen from "../src/screens/PartnerInfoScreen";

export default function PartnerInfoRoute() {
  const params = useLocalSearchParams();
  const partnerData = getJsonParam(params.data);

  if (!partnerData) {
    router.back();
    return null;
  }

  return <PartnerInfoScreen data={partnerData} onBack={() => router.back()} />;
}

function getJsonParam(dataParam) {
  const value = Array.isArray(dataParam) ? dataParam[0] : dataParam;
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
