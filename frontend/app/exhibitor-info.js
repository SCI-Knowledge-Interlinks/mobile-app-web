import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import ExhibitorInfoScreen from "../src/screens/ExhibitorInfoScreen";

export default function ExhibitorInfoRoute() {
  const params = useLocalSearchParams();
  const exhibitorData = getJsonParam(params.data);

  if (!exhibitorData) {
    router.back();
    return null;
  }

  return (
    <ExhibitorInfoScreen data={exhibitorData} onBack={() => router.back()} />
  );
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
