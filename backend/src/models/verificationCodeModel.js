const { pool } = require("../config/database");

const mapVerificationCode = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    channel: row.channel,
    targetValue: row.target_value,
    purpose: row.purpose,
    otpHash: row.otp_hash,
    expiresAt: row.expires_at,
    isUsed: Boolean(row.is_used),
    usedAt: row.used_at,
    attemptCount: row.attempt_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Save or replace the latest verification code for the same target + channel + purpose.
 * `userId` is nullable because registration happens before the user row exists.
 */
const saveVerificationCode = async ({
  userId = null,
  channel,
  targetValue,
  purpose,
  otpHash,
  expiresAt,
}) => {
  await pool.execute(
    `INSERT INTO verification_codes (
      user_id,
      channel,
      target_value,
      purpose,
      otp_hash,
      expires_at,
      is_used,
      used_at,
      attempt_count,
      created_at,
      updated_at
    )
     VALUES (?, ?, ?, ?, ?, ?, FALSE, NULL, 0, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       user_id = VALUES(user_id),
       otp_hash = VALUES(otp_hash),
       expires_at = VALUES(expires_at),
       is_used = FALSE,
       used_at = NULL,
       attempt_count = 0,
       updated_at = NOW()`,
    [userId, channel, targetValue, purpose, otpHash, expiresAt]
  );
};

const findVerificationCode = async ({ channel, targetValue, purpose }) => {
  const [rows] = await pool.execute(
    `SELECT *
     FROM verification_codes
     WHERE channel = ? AND target_value = ? AND purpose = ?
     LIMIT 1`,
    [channel, targetValue, purpose]
  );

  return mapVerificationCode(rows[0]);
};

const incrementVerificationAttempts = async ({ channel, targetValue, purpose }) => {
  await pool.execute(
    `UPDATE verification_codes
     SET attempt_count = attempt_count + 1, updated_at = NOW()
     WHERE channel = ? AND target_value = ? AND purpose = ?`,
    [channel, targetValue, purpose]
  );
};

const markVerificationCodeUsed = async ({ channel, targetValue, purpose }) => {
  await pool.execute(
    `UPDATE verification_codes
     SET is_used = TRUE, used_at = NOW(), updated_at = NOW()
     WHERE channel = ? AND target_value = ? AND purpose = ?`,
    [channel, targetValue, purpose]
  );
};

const deleteVerificationCode = async ({ channel, targetValue, purpose }) => {
  await pool.execute(
    `DELETE FROM verification_codes
     WHERE channel = ? AND target_value = ? AND purpose = ?`,
    [channel, targetValue, purpose]
  );
};

/**
 * Remove old verification rows so the table stays small.
 * - expired rows are never useful again
 * - used rows for non-register flows can also be removed
 */
const cleanupVerificationCodes = async () => {
  const [result] = await pool.execute(
    `DELETE FROM verification_codes
     WHERE expires_at < NOW()
        OR (
          is_used = TRUE
          AND purpose IN ('login_email_otp', 'login_mobile_otp')
        )`
  );

  return result.affectedRows;
};

module.exports = {
  saveVerificationCode,
  findVerificationCode,
  incrementVerificationAttempts,
  markVerificationCodeUsed,
  deleteVerificationCode,
  cleanupVerificationCodes,
};
