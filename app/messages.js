import React from "react";
import { router } from "expo-router";

import MessagesScreen from "../src/screens/MessagesScreen";

export default function MessagesRoute() {
  return (
    <MessagesScreen
      onBack={() => router.back()}
      onOpenConversation={({ id, title }) =>
        router.push({
          pathname: "/chat/[id]",
          params: { id, title },
        })
      }
    />
  );
}
