const { sendPushNotification } = require("../firebase/firebaseAdmin");
const { pool } = require("../config/database");
  const [rows] = await pool.execute(
    `SELECT fcm_token, platform
     FROM user_device_tokens
     WHERE user_id = ? AND is_active = 1`,
    [userId]
  );

  return rows;
}

async function sendPushToUser(userId, { title, body, data = {} }) {
  const tokens = await getActiveTokensForUser(userId);
  if (!tokens.length) {
    return { sent: 0, failed: 0, results: [] };
  }

  const results = await Promise.allSettled(
    tokens.map((entry) =>
      sendPushNotification({
        token: entry.fcm_token,
        title,
        body,
        data: { ...data, platform: entry.platform },
      })
    )
  );

  return {
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
    results,
  };
}

module.exports = {
  getActiveTokensForUser,
  sendPushToUser,
  sendPushNotification,
};
