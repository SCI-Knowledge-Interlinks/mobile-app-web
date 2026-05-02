/**
 * In-memory OTP store
 *
 * IMPORTANT:
 * This is okay only for development.
 * Later move OTP storage to a real database or Redis.
 */
const otpStore = new Map();

/**
 * Save OTP hash and expiry for one email
 */
const saveOtpRecord = (email, record) => {
  otpStore.set(email, record);
};

/**
 * Get OTP record by email
 */
const getOtpRecord = (email) => {
  return otpStore.get(email);
};

/**
 * Delete OTP record by email
 */
const deleteOtpRecord = (email) => {
  otpStore.delete(email);
};

module.exports = {
  saveOtpRecord,
  getOtpRecord,
  deleteOtpRecord,
};

