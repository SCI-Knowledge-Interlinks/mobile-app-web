import { io } from "socket.io-client";

import { API_BASE_URL } from "../constants/config";
import { getAuthSession } from "./sessionService";

let socketInstance = null;

export async function getChatSocket() {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  const session = await getAuthSession();
  const token = session?.token;

  if (!token) {
    throw new Error("Authentication required for chat");
  }

  if (socketInstance) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
    return socketInstance;
  }

  socketInstance = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socketInstance;
}

export function disconnectChatSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export async function joinConversation(conversationId) {
  const socket = await getChatSocket();
  socket.emit("chat:join", { conversationId: String(conversationId) });
  return socket;
}

export function leaveConversation(socket, conversationId) {
  socket?.emit("chat:leave", { conversationId: String(conversationId) });
}

export function sendSocketMessage(socket, conversationId, body) {
  return new Promise((resolve, reject) => {
    socket.emit("chat:send", { conversationId: String(conversationId), body }, (response) => {
      if (response?.success) {
        resolve(response.message);
        return;
      }

      reject(new Error(response?.message || "Failed to send message"));
    });
  });
}

export function subscribeToMessages(socket, handler) {
  socket.on("chat:message", handler);
  return () => socket.off("chat:message", handler);
}
