import { router } from "expo-router";

function pickString(...values) {
  for (const value of values) {
    if (value == null) {
      continue;
    }
    const text = String(value).trim();
    if (text) {
      return text;
    }
  }
  return "";
}

/**
 * Navigate from FCM / notification data payload.
 * Supported keys (any one is enough):
 * - route | path | screen: "/messages", "messages", "session", etc.
 * - type | target: messages | session | notifications | home | badge | speakers | ...
 * - sessionId | session_id
 * - conversationId | chatId | conversation_id
 * - speakerId | exhibitorId | partnerId
 */
export function navigateFromNotificationData(data = {}) {
  if (!data || typeof data !== "object") {
    return false;
  }

  const route = pickString(data.route, data.path, data.screen).toLowerCase();
  const type = pickString(data.type, data.target, data.action).toLowerCase();
  const sessionId = pickString(data.sessionId, data.session_id);
  const conversationId = pickString(
    data.conversationId,
    data.conversation_id,
    data.chatId,
    data.chat_id
  );
  const speakerId = pickString(data.speakerId, data.speaker_id);
  const exhibitorId = pickString(data.exhibitorId, data.exhibitor_id);
  const partnerId = pickString(data.partnerId, data.partner_id);

  try {
    if (route.startsWith("/")) {
      router.push(route);
      return true;
    }

    if (sessionId || type === "session" || route === "session") {
      router.push({
        pathname: "/session-details-new",
        params: { id: sessionId || pickString(data.id) },
      });
      return true;
    }

    if (conversationId || type === "chat" || route === "chat") {
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: conversationId || pickString(data.id),
          title: pickString(data.title, data.chatTitle) || "Message",
        },
      });
      return true;
    }

    if (speakerId || type === "speaker" || route === "speaker") {
      router.push({
        pathname: "/speaker-info",
        params: { id: speakerId || pickString(data.id) },
      });
      return true;
    }

    if (exhibitorId || type === "exhibitor" || route === "exhibitor") {
      router.push({
        pathname: "/exhibitor-info",
        params: { id: exhibitorId || pickString(data.id) },
      });
      return true;
    }

    if (partnerId || type === "partner" || route === "partner") {
      router.push({
        pathname: "/partner-info",
        params: { id: partnerId || pickString(data.id) },
      });
      return true;
    }

    const destination = type || route;
    const routeMap = {
      messages: "/messages",
      message: "/messages",
      chat: "/messages",
      notifications: "/notifications",
      notification: "/notifications",
      home: "/home-new",
      badge: "/my-badge",
      "my-badge": "/my-badge",
      speakers: "/speakers",
      exhibition: "/exhibitor-new",
      exhibitors: "/exhibitor-new",
      conference: "/conference-list",
      sessions: "/conference-list",
      "event-info": "/event-info",
      event: "/event-info",
      gallery: "/gallery",
      awards: "/awards",
      partners: "/partners-new",
    };

    if (routeMap[destination]) {
      router.push(routeMap[destination]);
      return true;
    }
  } catch (error) {
    console.log("[FCM] notification navigation failed:", error?.message || error);
  }

  return false;
}
