const { getBearerToken, verifyAuthToken } = require("./authTokenService");
const { findUserById } = require("../models/userModel");
const {
  getConversationById,
  insertMessage,
  userInConversation,
} = require("../models/chatModel");
const { scheduleSupportAutoReply } = require("./chatSupportAutoReply");

function initializeChatSocket(io) {
  io.use((socket, next) => {
    const token = getBearerToken(socket.handshake.auth?.token || "");
    const payload = verifyAuthToken(token);

    if (!payload?.userId) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = Number(payload.userId);
    next();
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", async ({ conversationId }) => {
      const id = Number(conversationId);
      if (!id) {
        return;
      }

      const allowed = await userInConversation(socket.userId, id);
      if (!allowed) {
        return;
      }

      socket.join(`conversation:${id}`);
    });

    socket.on("chat:leave", ({ conversationId }) => {
      const id = Number(conversationId);
      if (!id) {
        return;
      }

      socket.leave(`conversation:${id}`);
    });

    socket.on("chat:send", async ({ conversationId, body }, callback) => {
      try {
        const id = Number(conversationId);
        const text = String(body || "").trim();

        if (!id || !text) {
          callback?.({ success: false, message: "Invalid message" });
          return;
        }

        const conversation = await getConversationById(id, socket.userId);
        if (!conversation) {
          callback?.({ success: false, message: "Conversation not found" });
          return;
        }

        const user = await findUserById(socket.userId);
        const senderName =
          [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "You";

        const message = await insertMessage({
          conversationId: id,
          senderUserId: socket.userId,
          senderName,
          body: text,
        });

        io.to(`conversation:${id}`).emit("chat:message", message);

        if (conversation.type === "support") {
          scheduleSupportAutoReply(io, id);
        }

        callback?.({ success: true, message });
      } catch (error) {
        console.error("chat:send failed:", error);
        callback?.({ success: false, message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {});
  });
}

module.exports = {
  initializeChatSocket,
};
