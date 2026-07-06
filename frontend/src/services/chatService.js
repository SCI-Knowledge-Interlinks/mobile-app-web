import { authenticatedApiRequest, jsonOptions } from "./apiClient";

export function getConversations() {
  return authenticatedApiRequest("/chat/conversations").then((data) => data.conversations || []);
}

export function getConversationMessages(conversationId) {
  return authenticatedApiRequest(`/chat/conversations/${conversationId}/messages`).then((data) => ({
    conversation: data.conversation,
    messages: data.messages || [],
  }));
}

export function createConversation({ title, participantType, participantId }) {
  return authenticatedApiRequest(
    "/chat/conversations",
    jsonOptions("POST", {
      title,
      participantType,
      participantId,
    })
  ).then((data) => data.conversation);
}

export function sendChatMessage(conversationId, body) {
  return authenticatedApiRequest(
    `/chat/conversations/${conversationId}/messages`,
    jsonOptions("POST", { body })
  ).then((data) => data.chatMessage);
}
