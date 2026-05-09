const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { sendOtpEmail } = require("../services/emailService");

const {
  findUserById,
  findUserByEmail,
  findUserByMobile,
  createUser,
  updateUserProfileDetails,
  updateUserProfileImage,
  updateUserPasswordByEmail,
} = require("../models/userModel");

const {
  saveVerificationCode,
  findVerificationCode,
  incrementVerificationAttempts,
  markVerificationCodeUsed,
  deleteVerificationCode,
} = require("../models/verificationCodeModel");

const {
  createAuthToken,
  getBearerToken,
  verifyAuthToken,
} = require("../services/authTokenService");

const {
  isValidEmail,
  isValidPassword,
  isValidMobile,
  isValidCountryCode,
  isValidOtp,
} = require("../utils/validators");

/**
 * Generate 6-digit OTP
 */
const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const EMAIL_PURPOSES = {
  register: "register_email_verify",
  login: "login_email_otp",
  resetPassword: "reset_password_email_otp",
};

const getEmailPurpose = (rawPurpose) => {
  if (rawPurpose === EMAIL_PURPOSES.login) {
    return EMAIL_PURPOSES.login;
  }

  if (rawPurpose === EMAIL_PURPOSES.resetPassword) {
    return EMAIL_PURPOSES.resetPassword;
  }

  return EMAIL_PURPOSES.register;
};

const toPublicUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    countryCode: user.countryCode || "+91",
    mobileNumber: user.mobile,
    company: user.company,
    designation: user.designation,
    gender: user.gender,
    city: user.city,
    country: user.country,
    pincode: user.pincode,
    profileImageUrl: user.profileImageUrl,
    isEmailVerified: user.emailVerified,
    isMobileVerified: user.mobileVerified,
  };
};

const toAuthResponse = (user) => ({
  token: createAuthToken(user),
  user: toPublicUser(user),
});

const getRequestBaseUrl = (req) => {
  return process.env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get("host")}`;
};

const deleteUploadedFile = (filePath) => {
  if (!filePath) {
    return;
  }

  fs.unlink(filePath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error("Failed to delete uploaded file:", error.message || error);
    }
  });
};

const getSessionUser = async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const payload = verifyAuthToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Get session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore session",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const { email = "", mobileNumber = "" } = req.query || {};

    if (!isValidEmail(email) && !isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Valid email or mobile number is required",
      });
    }

    const user = isValidEmail(email)
      ? await findUserByEmail(String(email).trim().toLowerCase())
      : await findUserByMobile(String(mobileNumber).trim());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};

const saveUserProfile = async (req, res) => {
  try {
    const {
      email = "",
      name = "",
      countryCode = "+91",
      mobileNumber = "",
      company = "",
      designation = "",
      gender = "",
      city = "",
      country = "",
      pincode = "",
    } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!String(name).trim() || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (!isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    if (!isValidCountryCode(countryCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country code",
      });
    }

    const updatedUser = await updateUserProfileDetails({
      email: String(email).trim().toLowerCase(),
      name: String(name || "").trim(),
      countryCode: String(countryCode || "").trim(),
      mobileNumber: String(mobileNumber || "").trim(),
      company: String(company || "").trim() || null,
      designation: String(designation || "").trim() || null,
      gender: String(gender || "").trim() || null,
      city: String(city || "").trim() || null,
      country: String(country || "").trim() || null,
      pincode: String(pincode || "").trim() || null,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    console.error("Save profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save profile details",
    });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const payload = verifyAuthToken(token);

    if (!payload) {
      deleteUploadedFile(req.file?.path);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      deleteUploadedFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileImagePath = `/uploads/profile-images/${req.file.filename}`;
    const profileImageUrl = `${getRequestBaseUrl(req)}${profileImagePath}`;
    const updatedUser = await updateUserProfileImage({
      userId: user.id,
      profileImageUrl,
    });

    if (user.profileImageUrl) {
      const previousPath = new URL(user.profileImageUrl, getRequestBaseUrl(req)).pathname;
      const uploadRoot = path.resolve(__dirname, "../../uploads");
      const previousFilePath = path.resolve(__dirname, "../..", previousPath.slice(1));

      if (previousFilePath.startsWith(uploadRoot)) {
        deleteUploadedFile(previousFilePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      profileImageUrl,
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    deleteUploadedFile(req.file?.path);
    console.error("Upload profile photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email = "", password = "", otp = "" } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!isValidOtp(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const verificationCode = await findVerificationCode({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: EMAIL_PURPOSES.resetPassword,
    });

    if (!verificationCode || !verificationCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Please verify the reset code before changing password",
      });
    }

    if (Date.now() > new Date(verificationCode.expiresAt).getTime()) {
      await deleteVerificationCode({
        channel: "email",
        targetValue: normalizedEmail,
        purpose: EMAIL_PURPOSES.resetPassword,
      });

      return res.status(400).json({
        success: false,
        message: "Reset code expired. Please request a new code",
      });
    }

    const otpMatched = await bcrypt.compare(String(otp), verificationCode.otpHash);

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code",
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const updatedUser = await updateUserPasswordByEmail({
      email: normalizedEmail,
      passwordHash,
    });

    await deleteVerificationCode({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: EMAIL_PURPOSES.resetPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user: toPublicUser(updatedUser),
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

/**
 * Register user
 */
const registerUser = async (req, res) => {
  try {
    const {
      name = "",
      email = "",
      password = "",
      countryCode = "+91",
      mobileNumber = "",
    } = req.body || {};

    if (!String(name).trim() || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!isValidMobile(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    if (!isValidCountryCode(countryCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country code",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);
    const emailVerificationCode = await findVerificationCode({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: EMAIL_PURPOSES.register,
    });
    const mobileVerificationCode = await findVerificationCode({
      channel: "mobile",
      targetValue: String(mobileNumber).trim(),
      purpose: "register_mobile_verify",
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (!emailVerificationCode || !emailVerificationCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before registering",
      });
    }

    if (!mobileVerificationCode || !mobileVerificationCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: "Please verify your mobile number before registering",
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const userPayload = {
      name: String(name).trim(),
      email: normalizedEmail,
      countryCode: String(countryCode).trim(),
      mobile: String(mobileNumber).trim(),
      passwordHash,
      emailVerified: true,
      mobileVerified: true,
    };

    const newUser = await createUser(userPayload);

    await deleteVerificationCode({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: EMAIL_PURPOSES.register,
    });
    await deleteVerificationCode({
      channel: "mobile",
      targetValue: String(mobileNumber).trim(),
      purpose: "register_mobile_verify",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...toAuthResponse(newUser),
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
  try {
    const { email = "", password = "" } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...toAuthResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/**
 * Send OTP to email
 */
const sendEmailOtp = async (req, res) => {
  try {
    const {
      email = "",
      password = "",
      purpose = EMAIL_PURPOSES.register,
    } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPurpose = getEmailPurpose(purpose);
    const existingUser = await findUserByEmail(normalizedEmail);

    if (normalizedPurpose === EMAIL_PURPOSES.register && existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (
      (normalizedPurpose === EMAIL_PURPOSES.login ||
        normalizedPurpose === EMAIL_PURPOSES.resetPassword) &&
      !existingUser
    ) {
      return res.status(404).json({
        success: false,
        message:
          normalizedPurpose === EMAIL_PURPOSES.login
            ? "User not found, please register"
            : "No user found with this email",
      });
    }

    if (normalizedPurpose === EMAIL_PURPOSES.login) {
      if (!isValidPassword(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      const passwordMatched = await bcrypt.compare(
        String(password),
        existingUser.passwordHash || ""
      );

      if (!passwordMatched) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    }

    const otp = generateOtp();
    console.log("Generated OTP:", { normalizedEmail }, { otp });
    const otpHash = await bcrypt.hash(otp, 10);

    /**
     * OTP expires in 5 minutes
     */
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await saveVerificationCode({
      userId: existingUser?.id ?? null,
      channel: "email",
      targetValue: normalizedEmail,
      purpose: normalizedPurpose,
      otpHash,
      expiresAt,
    });

    /* Commented to test dummy email- for app testing  */
    await sendOtpEmail({
      toEmail: normalizedEmail,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

/**
 * Verify OTP for email - REGISTER
 */
const verifyEmailOtp = async (req, res) => {
  try {
    const { email = "", otp = "", purpose = EMAIL_PURPOSES.register } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!isValidOtp(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPurpose = getEmailPurpose(purpose);
  /* FOR MASTER OTP */
    const masterOtp = String(process.env.MASTER_OTP || "").trim();
    const masterUserEmail = String(process.env.MASTER_USER_EMAIL || "")
    .trim()
    .toLowerCase()
    if (normalizedPurpose === EMAIL_PURPOSES.login &&
         masterOtp &&
          masterUserEmail &&
        normalizedEmail === masterUserEmail &&
        String(otp).trim() === masterOtp
      ) {
        const masterUser = await findUserByEmail(normalizedEmail);

        if (!masterUser) {
          return res.status(404).json({
         success: false,
            message: "User not found, please register",
          });
        }

        return res.status(200).json({
          success: true,
            message: "OTP verified successfully",
            ...toAuthResponse(masterUser),
        });

    }

    /*---------- */
    const verificationCode = await findVerificationCode({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: normalizedPurpose,
    });

    if (!verificationCode || !verificationCode.otpHash || !verificationCode.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this email",
      });
    }

    if (verificationCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: "OTP already used",
      });
    }

    if (Date.now() > new Date(verificationCode.expiresAt).getTime()) {
      await deleteVerificationCode({
        channel: "email",
        targetValue: normalizedEmail,
        purpose: normalizedPurpose,
      });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (verificationCode.attemptCount >= 5) {
      await deleteVerificationCode({
        channel: "email",
        targetValue: normalizedEmail,
        purpose: normalizedPurpose,
      });
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP",
      });
    }

    await incrementVerificationAttempts({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: normalizedPurpose,
    });

    const isMatch = await bcrypt.compare(String(otp), verificationCode.otpHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await markVerificationCodeUsed({
      channel: "email",
      targetValue: normalizedEmail,
      purpose: normalizedPurpose,
    });

    // Register/reset-password verification must stay until the user submits the next form.
    // Login OTPs can be deleted immediately after success.
    if (normalizedPurpose === EMAIL_PURPOSES.login) {
      await deleteVerificationCode({
        channel: "email",
        targetValue: normalizedEmail,
        purpose: normalizedPurpose,
      });
    }

    const loginUser =
      normalizedPurpose === EMAIL_PURPOSES.login
        ? await findUserByEmail(normalizedEmail)
        : null;

    return res.status(200).json({
      success: true,
      message:
        normalizedPurpose === EMAIL_PURPOSES.register
          ? "Email verified successfully"
          : "OTP verified successfully",
      ...(loginUser ? toAuthResponse(loginUser) : {}),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendEmailOtp,
  verifyEmailOtp,
  resetPassword,
  getCurrentUser,
  saveUserProfile,
  uploadProfilePhoto,
  getSessionUser,
};
