import React from "react";
import { router, useLocalSearchParams } from "expo-router";

import ChatThreadScreen from "../../src/screens/ChatThreadScreen";

export default function ChatThreadRoute() {
  const params = useLocalSearchParams();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const title = Array.isArray(params.title) ? params.title[0] : params.title;

  if (!conversationId) {
    router.back();
    return null;
  }

  return (
    <ChatThreadScreen
      conversationId={conversationId}
      title={title}
      onBack={() => router.back()}
    />
  );
}
