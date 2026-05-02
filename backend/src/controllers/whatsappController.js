const { sendInteraktTemplateMessage } = require("../services/mobileService");
const bcrypt = require("bcryptjs");
const { findUserByMobile } = require("../models/userModel");
const { createAuthToken } = require("../services/authTokenService");
const { isValidCountryCode } = require("../utils/validators");
const {
  saveVerificationCode,
  findVerificationCode,
  incrementVerificationAttempts,
  markVerificationCodeUsed,
  deleteVerificationCode,
} = require("../models/verificationCodeModel");

const OTP_EXPIRY_MS = 5 * 60 * 1000;

const MOBILE_PURPOSES = {
  register: "register_mobile_verify",
  login: "login_mobile_otp",
};

const getMobilePurpose = (rawPurpose) => {
  if (rawPurpose === MOBILE_PURPOSES.login) {
    return MOBILE_PURPOSES.login;
  }

  return MOBILE_PURPOSES.register;
};

const isValidMobileNumber = (value) => {
  return /^\d{4,15}$/.test(String(value || "").trim());
};

const toPublicUser = (user) => ({
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
});

const toAuthResponse = (user) => ({
  token: createAuthToken(user),
  user: toPublicUser(user),
});

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const normalizeMobileNumber = (phoneNumber) => {
  return String(phoneNumber || "").replace(/\D/g, "");
};

const sendWhatsAppOtp = async (req, res) => {
  try {
    const {
      countryCode = "+91",
      phoneNumber,
      name,
      purpose = MOBILE_PURPOSES.register,
    } = req.body || {};

    const cleanPhone = normalizeMobileNumber(phoneNumber);
    const cleanCountryCode = String(countryCode || "").trim();
    const normalizedPurpose = getMobilePurpose(purpose);

    if (!isValidMobileNumber(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    if (!isValidCountryCode(cleanCountryCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country code",
      });
    }

    const existingUser =
      normalizedPurpose === MOBILE_PURPOSES.login
        ? await findUserByMobile(cleanPhone)
        : null;

    if (normalizedPurpose === MOBILE_PURPOSES.login && !existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found, please register",
      });
    }

    const otp = generateOtp();
    console.log("Generated OTP:", { countryCode: cleanCountryCode, phoneNumber: cleanPhone }, { otp });
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await saveVerificationCode({
      userId: existingUser?.id ?? null,
      channel: "mobile",
      targetValue: cleanPhone,
      purpose: normalizedPurpose,
      otpHash,
      expiresAt,
    });


     /* Commented to test dummy mobile No.- for app testing  */
    
    await sendInteraktTemplateMessage({
      countryCode: cleanCountryCode,
      phoneNumber: cleanPhone,
      callbackData: process.env.INTERAKT_CALLBACK_DATA || "otp_test",
      templateName: process.env.INTERAKT_OTP_TEMPLATE_NAME || "prawaas_logic_otp",
      bodyValues: [otp],
      buttonValues: {
        "0": [otp],
      },
    });

    return res.json({
      success: true,
      message: "WhatsApp OTP sent successfully",
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp message",
    });
  }
};

const verifyWhatsAppOtp = async (req, res) => {
  try {
    const {
      countryCode = "+91",
      phoneNumber,
      otp,
      purpose = MOBILE_PURPOSES.register,
    } = req.body || {};
    const cleanPhone = normalizeMobileNumber(phoneNumber);
    const cleanCountryCode = String(countryCode || "").trim();
    const cleanOtp = String(otp || "").trim();
    const normalizedPurpose = getMobilePurpose(purpose);

    if (!isValidMobileNumber(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    if (!isValidCountryCode(cleanCountryCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country code",
      });
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    const verificationCode = await findVerificationCode({
      channel: "mobile",
      targetValue: cleanPhone,
      purpose: normalizedPurpose,
    });

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this mobile number",
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
        channel: "mobile",
        targetValue: cleanPhone,
        purpose: normalizedPurpose,
      });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (verificationCode.attemptCount >= 5) {
      await deleteVerificationCode({
        channel: "mobile",
        targetValue: cleanPhone,
        purpose: normalizedPurpose,
      });
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP",
      });
    }

    await incrementVerificationAttempts({
      channel: "mobile",
      targetValue: cleanPhone,
      purpose: normalizedPurpose,
    });

    const isMatch = await bcrypt.compare(cleanOtp, verificationCode.otpHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await markVerificationCodeUsed({
      channel: "mobile",
      targetValue: cleanPhone,
      purpose: normalizedPurpose,
    });

    // Register verification must stay until the Register API saves the user.
    // Login OTP can be removed immediately after successful verification.
    if (normalizedPurpose !== MOBILE_PURPOSES.register) {
      await deleteVerificationCode({
        channel: "mobile",
        targetValue: cleanPhone,
        purpose: normalizedPurpose,
      });
    }

    const loginUser =
      normalizedPurpose === MOBILE_PURPOSES.login
        ? await findUserByMobile(cleanPhone)
        : null;

    return res.json({
      success: true,
      message: "Mobile verified successfully",
      ...(loginUser ? toAuthResponse(loginUser) : {}),
    });
  } catch (error) {
    console.error("WhatsApp verify error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

module.exports = {
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
};
