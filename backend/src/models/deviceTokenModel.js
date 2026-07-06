const { pool } = require("../config/database");

async function upsertDeviceToken({ userId, fcmToken, platform }) {
  await pool.execute(
    `INSERT INTO user_device_tokens (user_id, fcm_token, platform, is_active)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       user_id = VALUES(user_id),
       platform = VALUES(platform),
       is_active = 1,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, fcmToken, platform]
  );
}

async function deactivateDeviceToken({ userId, fcmToken }) {
  await pool.execute(
    `UPDATE user_device_tokens
     SET is_active = 0, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = ? AND fcm_token = ?`,
    [userId, fcmToken]
  );
}

module.exports = {
  upsertDeviceToken,
  deactivateDeviceToken,
};
