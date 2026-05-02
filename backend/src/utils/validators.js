/**
 * Email validation
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
};

/**
 * Password validation
 * Keep it simple for now.
 */
const isValidPassword = (password) => {
  return String(password || "").trim().length >= 6;
};

/**
 * Mobile validation
 * Keep this flexible because national mobile number lengths vary by country.
 */
const isValidMobile = (mobile) => {
  return /^\d{4,15}$/.test(String(mobile || "").trim());
};

const isValidCountryCode = (countryCode) => {
  return /^\+\d{1,4}$/.test(String(countryCode || "").trim());
};

/**
 * OTP validation
 */
const isValidOtp = (otp) => {
  return /^\d{6}$/.test(String(otp || "").trim());
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidMobile,
  isValidCountryCode,
  isValidOtp,
};
