const express = require("express");
const {
  registerUser,
  loginUser,
  sendEmailOtp,
  verifyEmailOtp,
  resetPassword,
  getCurrentUser,
  getSessionUser,
  saveUserProfile,
  uploadProfilePhoto,
  registerDeviceToken,
} = require("../controllers/authController");
const { uploadProfileImage } = require("../middleware/profileImageUpload");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Register route
 */
router.post("/register", registerUser);

/**
 * Login route
 */
router.post("/login", loginUser);

/**
 * Restore logged-in user from session token
 */
router.get("/me", getSessionUser);

/**
 * Send OTP to email
 */
router.post("/send-email-otp", sendEmailOtp);

/**
 * Verify OTP
 */
router.post("/verify-email-otp", verifyEmailOtp);

/**
 * Reset password after OTP verification
 */
router.post("/reset-password", resetPassword);

/**
 * Get latest user details
 */
router.get("/user", getCurrentUser);

/**
 * Save profile details
 */
router.put("/profile", saveUserProfile);

/**
 * Upload profile photo
 */
router.post(
  "/profile-photo",
  uploadProfileImage.single("profileImage"),
  uploadProfilePhoto
);

/**
 * Save the device's FCM push token for the logged-in user.
 */
router.post("/device-token", requireAuth, registerDeviceToken);

module.exports = router;
