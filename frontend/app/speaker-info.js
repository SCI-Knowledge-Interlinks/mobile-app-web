import React, { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import SpeakerInfoScreenNew from "../src/screens/SpeakerInfoScreenNew";
import { createConversation } from "../src/services/chatService";
import { colors } from "../src/constants/colors";

export default function SpeakerInfoRoute() {
  const params = useLocalSearchParams();
  const speakerData = getSpeakerDataFromParams(params.data);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  if (!speakerData) {
    router.back();
    return null;
  }

  const openSpeakerChat = async (speaker) => {
    if (isOpeningChat) {
      return;
    }

    setIsOpeningChat(true);

    try {
      const conversation = await createConversation({
        title: speaker.name,
        participantType: "speaker",
        participantId: speaker.id,
      });

      router.push({
        pathname: "/chat/[id]",
        params: {
          id: conversation.id,
          title: conversation.title,
        },
      });
    } catch (error) {
      router.push("/messages");
    } finally {
      setIsOpeningChat(false);
    }
  };

  if (isOpeningChat) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SpeakerInfoScreenNew
      data={speakerData}
      onBack={() => router.back()}
      onMessage={(speaker) => openSpeakerChat(speaker)}
    />
  );
}

function getSpeakerDataFromParams(dataParam) {
  const value = Array.isArray(dataParam) ? dataParam[0] : dataParam;

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
