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
} = require("../controllers/authController");
const { uploadProfileImage } = require("../middleware/profileImageUpload");

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

module.exports = router;
