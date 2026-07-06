const express = require("express");
const {
  getConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.post("/conversations/:conversationId/messages", sendMessage);

module.exports = router;
