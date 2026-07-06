const { insertMessage } = require("../models/chatModel");

const supportReplyTimers = new Map();

function scheduleSupportAutoReply(io, conversationId) {
  const key = String(conversationId);

  if (supportReplyTimers.has(key)) {
    clearTimeout(supportReplyTimers.get(key));
  }

  const timer = setTimeout(async () => {
    supportReplyTimers.delete(key);

    try {
      const reply = await insertMessage({
        conversationId,
        senderUserId: null,
        senderName: "Event Support",
        body: "Thanks for your message. Our team will get back to you shortly during event hours.",
      });

      io?.to(`conversation:${conversationId}`).emit("chat:message", reply);
    } catch (error) {
      console.error("Support auto-reply failed:", error);
    }
  }, 1500);

  supportReplyTimers.set(key, timer);
}

module.exports = {
  scheduleSupportAutoReply,
};
