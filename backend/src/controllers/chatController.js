const { findUserById } = require("../models/userModel");
const {
  listConversationsForUser,
  getConversationById,
  listMessages,
  createDirectConversation,
  findDirectConversationByMetadata,
  insertMessage,
  markConversationRead,
} = require("../models/chatModel");
const { resolveAuthUserId } = require("../middleware/authMiddleware");
const { scheduleSupportAutoReply } = require("../services/chatSupportAutoReply");

function getUserId(req) {
  const fromAuth = resolveAuthUserId(req);
  if (fromAuth) {
    return fromAuth;
  }

  const queryUserId = Number(req.query.userId || req.body?.userId);
  return Number.isFinite(queryUserId) && queryUserId > 0 ? queryUserId : null;
}

async function getConversations(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await listConversationsForUser(userId);

    return res.json({
      success: true,
      message: "Conversations fetched successfully",
      conversations,
    });
  } catch (error) {
    console.error("getConversations failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
}

async function getConversationMessages(req, res) {
  try {
    const userId = getUserId(req);
    const conversationId = Number(req.params.conversationId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversation = await getConversationById(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const beforeId = req.query.beforeId ? Number(req.query.beforeId) : null;
    const messages = await listMessages(conversationId, userId, { beforeId });

    await markConversationRead(conversationId, userId);

    return res.json({
      success: true,
      message: "Messages fetched successfully",
      conversation,
      messages,
    });
  } catch (error) {
    console.error("getConversationMessages failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
}

async function createConversation(req, res) {
  try {
    const userId = getUserId(req);
    const title = String(req.body?.title || "").trim();
    const participantType = String(req.body?.participantType || "").trim();
    const participantId = req.body?.participantId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Conversation title is required",
      });
    }

    if (participantType && participantId != null) {
      const existingId = await findDirectConversationByMetadata(
        userId,
        `${participantType}Id`,
        participantId
      );

      if (existingId) {
        const conversation = await getConversationById(existingId, userId);
        return res.json({
          success: true,
          message: "Conversation already exists",
          conversation,
        });
      }
    }

    const metadata =
      participantType && participantId != null
        ? { [`${participantType}Id`]: String(participantId) }
        : null;

    const conversationId = await createDirectConversation(userId, {
      title,
      metadata,
    });

    const conversation = await getConversationById(conversationId, userId);

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("createConversation failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
}

async function sendMessage(req, res) {
  try {
    const userId = getUserId(req);
    const conversationId = Number(req.params.conversationId);
    const body = String(req.body?.body || "").trim();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Message body is required",
      });
    }

    const conversation = await getConversationById(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const user = await findUserById(userId);
    const senderName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "You";

    const message = await insertMessage({
      conversationId,
      senderUserId: userId,
      senderName,
      body,
    });

    const io = req.app.get("io");
    io?.to(`conversation:${conversationId}`).emit("chat:message", message);

    if (conversation.type === "support") {
      scheduleSupportAutoReply(io, conversationId);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chatMessage: message,
    });
  } catch (error) {
    console.error("sendMessage failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
}

module.exports = {
  getConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
};
