import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Toast } from "../components";
import CountryCodePicker from "../components/CountryCodePicker";
import { defaultCountryCode } from "../constants/countryCodes";
import NoInternetScreen from "./NoInternetScreen";
import {
  registerUser,
  resetPassword,
  sendEmailOtp,
  sendMobileOtp,
  verifyEmailOtp,
  verifyMobileOtp,
} from "../services/authService";
import { saveAuthSession } from "../services/sessionService";
import { getApiErrorMessage, isNoInternetError } from "../utils/network";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
  validateMobileWithCountryCode,
} from "../validations/authValidations";

const appIcon = require("../assets/app_logo.png");
const OTP_LENGTH = 6;
const PRIMARY_COLOR = "#e65539";

const emptyOtp = () => Array(OTP_LENGTH).fill("");

export default function LoginScreen() {
  const router = useRouter();
  const pendingInternetActionRef = useRef(null);
  const otpRefs = useRef({});
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallScreen = width < 480;
  const isTabletOrDesktop = width >= 768;
  const logoWidth = Math.min(width - 48, isSmallScreen ? 300 : 340);
  const cardMaxWidth = useMemo(() => {
    if (isTabletOrDesktop) return 420;
    if (isSmallScreen) return width - 24;
    return Math.min(width - 32, 420);
  }, [width, isSmallScreen, isTabletOrDesktop]);
  const authCardMaxHeight = isTabletOrDesktop
    ? Math.min(height - 72, 760)
    : Math.min(height - 36, 680);

  const [view, setView] = useState("options");
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [countryCode, setCountryCode] = useState(defaultCountryCode.dialCode);
  const [countryIso, setCountryIso] = useState(defaultCountryCode.iso);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [verifiedResetOtp, setVerifiedResetOtp] = useState("");

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [otp, setOtp] = useState(emptyOtp());
  const [otpType, setOtpType] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [emailOtp, setEmailOtp] = useState(emptyOtp());
  const [mobileOtp, setMobileOtp] = useState(emptyOtp());
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(null);
  const [mobileVerified, setMobileVerified] = useState(null);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showNoInternet, setShowNoInternet] = useState(false);

  const shouldShowWelcome = !["mobile", "resetPassword", "newPassword"].includes(view);

  const setErrorMessage = (text) => {
    setMessageType("error");
    setMessage(text);
  };

  const setSuccessMessage = (text) => {
    setMessageType("success");
    setMessage(text);
  };

  const clearMessage = () => setMessage("");
  const clearErrors = () => setErrors({});

  const resetAuthForm = () => {
    setName("");
    setEmail("");
    setResetEmail("");
    setCountryCode(defaultCountryCode.dialCode);
    setCountryIso(defaultCountryCode.iso);
    setMobileNumber("");
    setPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setVerifiedResetOtp("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setFocusedField("");
    setOtp(emptyOtp());
    setOtpType("");
    setShowOtpPopup(false);
    setEmailOtp(emptyOtp());
    setMobileOtp(emptyOtp());
    setShowEmailOtp(false);
    setShowMobileOtp(false);
    setEmailVerified(null);
    setMobileVerified(null);
  };

  const openNoInternetScreen = (retryAction) => {
    pendingInternetActionRef.current = retryAction;
    setShowNoInternet(true);
  };

  const retryInternetAction = async () => {
    if (!pendingInternetActionRef.current) return;

    try {
      setShowNoInternet(false);
      await pendingInternetActionRef.current();
    } catch (error) {
      if (isNoInternetError(error)) {
        setShowNoInternet(true);
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleTabClick = (tab) => {
    clearErrors();
    clearMessage();
    resetAuthForm();
    setActiveTab(tab);
    setView(tab === "login" ? "options" : "register");
  };

  const updateError = (field, value = "") => {
    setErrors((current) => ({ ...current, [field]: value }));
  };

  const getInputFocusProps = (field) => ({
    onFocus: () => setFocusedField(field),
    onBlur: () => setFocusedField(""),
    selectionColor: PRIMARY_COLOR,
    cursorColor: PRIMARY_COLOR,
  });

  const getInputStyle = (field, hasError, extraStyles = []) => [
    styles.input,
    ...extraStyles,
    focusedField === field && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const getHomeParams = () => ({
    name: name.trim(),
    email: email.trim(),
    userEmail: email.trim(),
    countryCode,
    mobileNumber,
    mobile: `${countryCode} ${mobileNumber}`,
    designation: "",
    message: "You have successfully logged in",
  });

  const goHome = () => {
    router.replace({ pathname: "/home", params: getHomeParams() });
  };

  const validateEmailLogin = () => {
    const nextErrors = {};
    if (!isValidEmail(email)) nextErrors.email = "Please enter a valid email address.";
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateMobileLogin = () => {
    const nextErrors = {};
    const mobileError = validateMobileWithCountryCode(countryCode, mobileNumber);
    if (mobileError) nextErrors.mobileNumber = mobileError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const nextErrors = {};
    if (!isValidName(name)) nextErrors.name = "Name must be at least 2 characters.";
    if (!isValidEmail(email)) nextErrors.email = "Please enter a valid email address.";
    const mobileError = validateMobileWithCountryCode(countryCode, mobileNumber);
    if (mobileError) nextErrors.mobileNumber = mobileError;
    if (!isValidPassword(password)) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendLoginOtp = async (type) => {
    if (isSendingOtp) return;

    try {
      setIsSendingOtp(true);
      clearMessage();

      if (type === "email") {
        await sendEmailOtp(email.trim(), "login_email_otp", password.trim());
      } else if (type === "mobile") {
        await sendMobileOtp({
          countryCode,
          phoneNumber: mobileNumber.trim(),
          name: name.trim() || "User",
          purpose: "login_mobile_otp",
        });
      } else {
        await sendEmailOtp(resetEmail.trim(), "reset_password_email_otp");
      }

      setOtpType(type);
      setOtp(emptyOtp());
      setShowOtpPopup(true);
      setSuccessMessage(type === "mobile" ? "OTP sent to your WhatsApp." : "OTP sent to your email.");
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(() => sendLoginOtp(type));
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!validateEmailLogin()) return;
    await sendLoginOtp("email");
  };

  const handleMobileLogin = async () => {
    if (!validateMobileLogin()) return;
    await sendLoginOtp("mobile");
  };

  const handleSendResetCode = async () => {
    const nextEmail = resetEmail.trim();
    if (!isValidEmail(nextEmail)) {
      updateError("resetEmail", "Please enter a valid email address.");
      return;
    }
    setEmail(nextEmail);
    setVerifiedResetOtp("");
    await sendLoginOtp("resetPassword");
  };

  const verifyOtpByChannel = async ({ channel, otpValue, purpose }) => {
    if (otpValue.length !== OTP_LENGTH) {
      throw new Error("Please enter all 6 OTP digits.");
    }

    if (channel === "email") {
      return verifyEmailOtp(email.trim(), otpValue, purpose);
    }

    return verifyMobileOtp({
      countryCode,
      phoneNumber: mobileNumber.trim(),
      otp: otpValue,
      purpose,
    });
  };

  const handleOtpLogin = async () => {
    const otpValue = otp.join("");

    try {
      if (otpType === "email") {
        const authData = await verifyOtpByChannel({
          channel: "email",
          otpValue,
          purpose: "login_email_otp",
        });
        await saveAuthSession(authData);
        goHome();
        return;
      }

      const authData = await verifyOtpByChannel({
        channel: "mobile",
        otpValue,
        purpose: "login_mobile_otp",
      });
      await saveAuthSession(authData);
      goHome();
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(handleOtpLogin);
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleResetPasswordContinue = async () => {
    const otpValue = otp.join("");

    try {
      await verifyEmailOtp((resetEmail || email).trim(), otpValue, "reset_password_email_otp");
      setShowOtpPopup(false);
      setOtp(emptyOtp());
      setVerifiedResetOtp(otpValue);
      setNewPassword("");
      setConfirmNewPassword("");
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setView("newPassword");
      setSuccessMessage("Code verified. Set your new password.");
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(handleResetPasswordContinue);
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleResetPassword = async () => {
    const nextErrors = {};
    if (!isValidPassword(newPassword)) {
      nextErrors.newPassword = "Password must be at least 6 characters.";
    }
    if (newPassword.trim() !== confirmNewPassword.trim()) {
      nextErrors.confirmNewPassword = "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsResettingPassword(true);
      await resetPassword({
        email: (resetEmail || email).trim(),
        password: newPassword.trim(),
        otp: verifiedResetOtp,
      });
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setVerifiedResetOtp("");
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setSuccessMessage("Password reset successfully. Please log in.");
      setView("email");
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(handleResetPassword);
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!isValidEmail(email)) {
      updateError("email", "Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingEmailOtp(true);
      await sendEmailOtp(email.trim(), "register_email_verify");
      setShowEmailOtp(true);
      setEmailOtp(emptyOtp());
      setEmailVerified(false);
      setSuccessMessage("OTP sent to your email.");
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(handleVerifyEmail);
        return;
      }

      setEmailVerified(false);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyMobile = async () => {
    const mobileError = validateMobileWithCountryCode(countryCode, mobileNumber);
    if (mobileError) {
      updateError("mobileNumber", mobileError);
      return;
    }

    try {
      setIsSendingMobileOtp(true);
      await sendMobileOtp({
        countryCode,
        phoneNumber: mobileNumber.trim(),
        name: name.trim() || "User",
        purpose: "register_mobile_verify",
      });
      setShowMobileOtp(true);
      setMobileOtp(emptyOtp());
      setMobileVerified(false);
      setSuccessMessage("OTP sent to your WhatsApp.");
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(handleVerifyMobile);
        return;
      }

      setMobileVerified(false);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;
    if (emailVerified !== true) {
      setErrorMessage("Please verify your email before registering.");
      return;
    }
    if (mobileVerified !== true) {
      setErrorMessage("Please verify your mobile number before registering.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const authData = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        countryCode,
        mobileNumber: mobileNumber.trim(),
      });
      await saveAuthSession(authData);
      goHome();
    } catch (error) {
      if (isNoInternetError(error)) {
        openNoInternetScreen(handleRegister);
        return;
      }

      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const updateOtp = (value, index, currentOtp, setCurrentOtp, refKey) => {
    const nextOtp = [...currentOtp];
    const nextDigit = value.replace(/\D/g, "").slice(0, 1);
    nextOtp[index] = nextDigit;
    setCurrentOtp(nextOtp);

    if (nextDigit && index < OTP_LENGTH - 1) {
      otpRefs.current[`${refKey}-${index + 1}`]?.focus?.();
    }
  };

  const handleOtpKeyPress = (event, index, currentOtp, refKey) => {
    if (event.nativeEvent.key === "Backspace" && !currentOtp[index] && index > 0) {
      otpRefs.current[`${refKey}-${index - 1}`]?.focus?.();
    }
  };

  const renderOtpInputs = ({
    value = otp,
    setValue = setOtp,
    large = false,
    refKey = "otp",
  } = {}) => (
    <View style={[styles.otpInputs, large && styles.otpInputsLarge]}>
      {value.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            otpRefs.current[`${refKey}-${index}`] = ref;
          }}
          value={digit}
          onChangeText={(text) => updateOtp(text, index, value, setValue, refKey)}
          onKeyPress={(event) => handleOtpKeyPress(event, index, value, refKey)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          selectionColor={PRIMARY_COLOR}
          cursorColor={PRIMARY_COLOR}
          style={[styles.otpInputField, large && styles.otpInputFieldLarge]}
        />
      ))}
    </View>
  );

  const renderPhoneFields = ({ resetVerification = false } = {}) => (
    <View style={styles.phoneFields}>
      <CountryCodePicker
        selectedCode={countryCode}
        selectedIso={countryIso}
        onSelect={(country) => {
          setCountryCode(country.dialCode);
          setCountryIso(country.iso);
          if (resetVerification) {
            setMobileVerified(null);
            setShowMobileOtp(false);
          }
        }}
      />
      <TextInput
        value={mobileNumber}
        onChangeText={(value) => {
          setMobileNumber(value.replace(/\D/g, ""));
          updateError("mobileNumber", "");
          if (resetVerification) {
            setMobileVerified(null);
            setShowMobileOtp(false);
          }
        }}
        placeholder="Enter mobile number"
        keyboardType="phone-pad"
        {...getInputFocusProps("mobile")}
        style={getInputStyle("mobile", !!errors.mobileNumber, [styles.mobileInput])}
      />
    </View>
  );

  if (showNoInternet) {
    return (
      <NoInternetScreen
        onRetry={retryInternetAction}
        isRetrying={isSendingOtp || isSendingEmailOtp || isSendingMobileOtp}
      />
    );
  }

  const isResetPasswordOtp = otpType === "resetPassword";
  const otpPopupWidth = Math.min(width - 24, 400);

  return (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.screenContainer,
          {
            paddingTop: insets.top + 24,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
      >
        <View style={[styles.pageWrapper, isTabletOrDesktop && styles.pageWrapperWide]}>
          <View style={styles.authToast}>
            <Toast message={message} type={messageType} onClose={clearMessage} />
          </View>

          <View style={[styles.authHeader, isSmallScreen && styles.authHeaderCompact]}>
            <View style={[styles.logoBox, { width: logoWidth }]}>
              <Image source={appIcon} style={styles.logoImage} resizeMode="contain" />
            </View>
          </View>

          <Card
            style={[
              styles.authCard,
              {
                width: "100%",
                maxWidth: cardMaxWidth,
                maxHeight: authCardMaxHeight,
              },
            ]}
          >
            <View style={styles.authTabs}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleTabClick("login")}
                style={[styles.tabItem, activeTab === "login" && styles.tabItemActive]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "login" && styles.tabItemTextActive,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleTabClick("register")}
                style={[styles.tabItem, activeTab === "register" && styles.tabItemActive]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "register" && styles.tabItemTextActive,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.cardBodyScroll}
              contentContainerStyle={styles.cardBodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardBody}>
                {shouldShowWelcome && (
                  <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeTitle}>
                      {activeTab === "login" ? "Welcome Back" : "Sign Up"}
                    </Text>
                    <Text style={styles.welcomeSubtitle}>
                      {activeTab === "login"
                        ? "Sign in to access your premium dashboard."
                        : "Create your account to continue."}
                    </Text>
                  </View>
                )}

                {view === "options" && activeTab === "login" && (
                  <View style={styles.actionButtons}>
                    <Button title="Login with Email" onPress={() => setView("email")} />
                    <Divider />
                    <Button
                      title="Login with Mobile Number"
                      onPress={() => setView("mobile")}
                    />
                  </View>
                )}

                {view === "email" && (
                  <View style={styles.actionButtons}>
                    <View style={styles.loginForm}>
                      <InputGroup label="EMAIL" error={errors.email}>
                        <TextInput
                          value={email}
                          onChangeText={(value) => {
                            setEmail(value);
                            updateError("email", "");
                          }}
                          placeholder="name@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          {...getInputFocusProps("email")}
                          style={getInputStyle("email", !!errors.email)}
                        />
                      </InputGroup>

                      <PasswordInput
                        label="PASSWORD"
                        value={password}
                        error={errors.password}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        onChangeText={(value) => {
                          setPassword(value);
                          updateError("password", "");
                        }}
                        focusProps={getInputFocusProps("password")}
                        inputStyle={getInputStyle("password", !!errors.password, [
                          styles.passwordInput,
                        ])}
                      />

                      <TouchableOpacity activeOpacity={0.8} onPress={() => {
                        clearErrors();
                        clearMessage();
                        setResetEmail(email);
                        setView("resetPassword");
                      }}>
                        <Text style={styles.forgotPassword}>Forgot password?</Text>
                      </TouchableOpacity>

                      <Button
                        title={isSendingOtp ? "Sending OTP..." : "Login"}
                        onPress={handleEmailLogin}
                        disabled={isSendingOtp}
                      />
                    </View>

                    <Divider />
                    <Button
                      title="Login with Mobile Number"
                      onPress={() => {
                        clearErrors();
                        clearMessage();
                        setView("mobile");
                      }}
                    />
                  </View>
                )}

                {view === "mobile" && (
                  <View style={styles.actionButtons}>
                    <Button
                      title="Login with Email"
                      onPress={() => {
                        clearErrors();
                        clearMessage();
                        setView("email");
                      }}
                    />
                    <Divider />
                    <View style={styles.loginForm}>
                      <View style={styles.welcomeSectionMobile}>
                        <Text style={styles.welcomeTitle}>Login with Mobile Number</Text>
                        <Text style={styles.welcomeSubtitle}>
                          Verification code will be sent to your mobile number.
                        </Text>
                      </View>

                      <InputGroup label="MOBILE NUMBER" error={errors.mobileNumber}>
                        {renderPhoneFields()}
                      </InputGroup>

                      <Button
                        title={isSendingOtp ? "Sending OTP..." : "Send OTP"}
                        onPress={handleMobileLogin}
                        disabled={isSendingOtp}
                      />
                    </View>
                  </View>
                )}

                {view === "resetPassword" && (
                  <View style={styles.resetPasswordForm}>
                    <View style={styles.resetHeader}>
                      <Text style={styles.resetTitle}>Reset Password</Text>
                      <Text style={styles.resetSubtitle}>code will be sent to email Id</Text>
                    </View>

                    <InputGroup label="EMAIL" error={errors.resetEmail}>
                      <TextInput
                        value={resetEmail}
                        onChangeText={(value) => {
                          setResetEmail(value);
                          updateError("resetEmail", "");
                        }}
                        placeholder="Enter your email id"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        {...getInputFocusProps("resetEmail")}
                        style={getInputStyle("resetEmail", !!errors.resetEmail)}
                      />
                    </InputGroup>

                    <Button
                      title={isSendingOtp ? "Sending Code..." : "Send Code"}
                      onPress={handleSendResetCode}
                      disabled={isSendingOtp}
                    />
                    <BackToLogin onPress={() => setView("email")} />
                  </View>
                )}

                {view === "newPassword" && (
                  <View style={styles.resetPasswordForm}>
                    <View style={styles.resetHeader}>
                      <Text style={styles.resetTitle}>Set new password</Text>
                      <Text style={styles.resetSubtitle}>
                        Enter a new password for {resetEmail || email}.
                      </Text>
                    </View>

                    <PasswordInput
                      label="NEW PASSWORD"
                      value={newPassword}
                      error={errors.newPassword}
                      showPassword={showNewPassword}
                      setShowPassword={setShowNewPassword}
                      onChangeText={(value) => {
                        setNewPassword(value);
                        updateError("newPassword", "");
                      }}
                      focusProps={getInputFocusProps("newPassword")}
                      inputStyle={getInputStyle("newPassword", !!errors.newPassword, [
                        styles.passwordInput,
                      ])}
                    />

                    <PasswordInput
                      label="CONFIRM PASSWORD"
                      value={confirmNewPassword}
                      error={errors.confirmNewPassword}
                      showPassword={showConfirmNewPassword}
                      setShowPassword={setShowConfirmNewPassword}
                      onChangeText={(value) => {
                        setConfirmNewPassword(value);
                        updateError("confirmNewPassword", "");
                      }}
                      focusProps={getInputFocusProps("confirmNewPassword")}
                      inputStyle={getInputStyle(
                        "confirmNewPassword",
                        !!errors.confirmNewPassword,
                        [styles.passwordInput]
                      )}
                    />

                    <Button
                      title={isResettingPassword ? "Resetting..." : "Reset Password"}
                      onPress={handleResetPassword}
                      disabled={isResettingPassword}
                    />
                    <BackToLogin onPress={() => setView("email")} />
                  </View>
                )}

                {view === "register" && (
                  <View style={styles.loginForm}>
                    <InputGroup label="NAME" error={errors.name}>
                      <TextInput
                        value={name}
                        onChangeText={(value) => {
                          setName(value);
                          updateError("name", "");
                        }}
                        placeholder="Enter your name"
                        {...getInputFocusProps("name")}
                        style={getInputStyle("name", !!errors.name)}
                      />
                    </InputGroup>

                    <InputGroup label="EMAIL" error={errors.email}>
                      <TextInput
                        value={email}
                        onChangeText={(value) => {
                          setEmail(value);
                          updateError("email", "");
                          setEmailVerified(null);
                          setShowEmailOtp(false);
                        }}
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        {...getInputFocusProps("registerEmail")}
                        style={getInputStyle("registerEmail", !!errors.email)}
                      />
                      <LinkButton
                        title={
                          isSendingEmailOtp
                            ? "Sending OTP..."
                            : emailVerified === true
                              ? "Email Verified"
                              : "Verify Email"
                        }
                        disabled={isSendingEmailOtp || emailVerified === true}
                        onPress={handleVerifyEmail}
                      />
                    </InputGroup>

                    {showEmailOtp && (
                      <InlineOtpBox
                        text={`Enter code sent to your email ${email || "name@example.com"}`}
                        value={emailOtp}
                        setValue={setEmailOtp}
                        refKey="emailOtp"
                        onDone={async () => {
                          try {
                            await verifyOtpByChannel({
                              channel: "email",
                              otpValue: emailOtp.join(""),
                              purpose: "register_email_verify",
                            });
                            setEmailVerified(true);
                            setShowEmailOtp(false);
                            setSuccessMessage("Email verified successfully.");
                          } catch (error) {
                            setEmailVerified(false);
                            setErrorMessage(getApiErrorMessage(error));
                          }
                        }}
                        renderOtpInputs={renderOtpInputs}
                      />
                    )}

                    <InputGroup label="MOBILE NUMBER" error={errors.mobileNumber}>
                      {renderPhoneFields({ resetVerification: true })}
                      <LinkButton
                        title={
                          isSendingMobileOtp
                            ? "Sending OTP..."
                            : mobileVerified === true
                              ? "Mobile Verified"
                              : "Verify Mobile Number"
                        }
                        disabled={isSendingMobileOtp || mobileVerified === true}
                        onPress={handleVerifyMobile}
                      />
                    </InputGroup>

                    {showMobileOtp && (
                      <InlineOtpBox
                        text={`Enter code sent to your mobile number ${countryCode} xxxxxx${mobileNumber.slice(-2)}`}
                        value={mobileOtp}
                        setValue={setMobileOtp}
                        refKey="mobileOtp"
                        onDone={async () => {
                          try {
                            await verifyOtpByChannel({
                              channel: "mobile",
                              otpValue: mobileOtp.join(""),
                              purpose: "register_mobile_verify",
                            });
                            setMobileVerified(true);
                            setShowMobileOtp(false);
                            setSuccessMessage("Mobile verified successfully.");
                          } catch (error) {
                            setMobileVerified(false);
                            setErrorMessage(getApiErrorMessage(error));
                          }
                        }}
                        renderOtpInputs={renderOtpInputs}
                      />
                    )}

                    <PasswordInput
                      label="PASSWORD"
                      value={password}
                      error={errors.password}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      onChangeText={(value) => {
                        setPassword(value);
                        updateError("password", "");
                      }}
                      focusProps={getInputFocusProps("registerPassword")}
                      inputStyle={getInputStyle("registerPassword", !!errors.password, [
                        styles.passwordInput,
                      ])}
                    />

                    <Button
                      title={isSendingOtp ? "Registering..." : "Register"}
                      onPress={handleRegister}
                      disabled={isSendingOtp}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </Card>
        </View>
      </View>

      {showOtpPopup && (
        <View style={styles.popupOverlay}>
          <Card style={[styles.otpCard, { width: otpPopupWidth }]}>
            <Text style={[styles.otpTitle, isResetPasswordOtp && styles.resetOtpTitle]}>
              {isResetPasswordOtp
                ? "Forget Password"
                : otpType === "mobile"
                  ? "Verify Phone"
                  : "Verify Email"}
            </Text>
            <Text style={[styles.otpSubtitle, isResetPasswordOtp && styles.resetOtpSubtitle]}>
              {isResetPasswordOtp
                ? `Enter code sent to your email id\n${resetEmail || email}`
                : otpType === "mobile"
                  ? `Enter WhatsApp code sent to your mobile number ${countryCode} xxxxxx${mobileNumber.slice(-2)}`
                  : `Enter verification code sent to email ${email}`}
            </Text>

            {renderOtpInputs({
              large: isResetPasswordOtp,
              refKey: isResetPasswordOtp ? "resetOtp" : "loginOtp",
            })}

            <View style={styles.popupButtonGroup}>
              {isResetPasswordOtp ? (
                <Button title="Continue" onPress={handleResetPasswordContinue} />
              ) : (
                <>
                  <Button title="Login" onPress={handleOtpLogin} />
                  <Button
                    title="Cancel"
                    onPress={() => setShowOtpPopup(false)}
                    variant="secondary"
                  />
                </>
              )}
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

function Divider() {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>OR</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function InputGroup({ label, error, children }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function PasswordInput({
  label,
  value,
  error,
  showPassword,
  setShowPassword,
  onChangeText,
  focusProps,
  inputStyle,
}) {
  return (
    <InputGroup label={label} error={error}>
      <View style={styles.passwordWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          {...focusProps}
          style={inputStyle}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowPassword((current) => !current)}
          style={styles.passwordToggle}
        >
          <Text style={styles.passwordToggleText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>
    </InputGroup>
  );
}

function LinkButton({ title, onPress, disabled }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled}>
      <Text style={[styles.linkButton, disabled && styles.linkButtonDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
}

function InlineOtpBox({ text, value, setValue, refKey, onDone, renderOtpInputs }) {
  return (
    <View style={styles.otpContainer}>
      <Text style={styles.otpSubtitle}>{text}</Text>
      {renderOtpInputs({ value, setValue, refKey })}
      <Button title="Done" onPress={onDone} />
    </View>
  );
}

function BackToLogin({ onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.backToLoginButton}>
      <Text style={styles.backToLoginText}>{"< Back to Login"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#33b864",
  },
  screenContainer: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: "#33b864",
  },
  pageWrapper: {
    width: "100%",
    maxHeight: "100%",
    alignItems: "center",
  },
  pageWrapperWide: {
    width: "100%",
  },
  authHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  authHeaderCompact: {
    marginBottom: 20,
  },
  logoBox: {
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  logoImage: {
    width: "100%",
    height: 110,
  },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    overflow: "hidden",
    padding: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  authTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#ed8874",
  },
  tabItemText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#999999",
  },
  tabItemTextActive: {
    color: "#ed8874",
  },
  cardBodyScroll: {
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  cardBodyContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  cardBody: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeSectionMobile: {
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 18,
  },
  actionButtons: {
    gap: 16,
  },
  loginForm: {
    gap: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
    marginLeft: 2,
  },
  input: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 18,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 15,
    fontSize: 15,
    color: "#111111",
    ...Platform.select({
      web: {
        caretColor: PRIMARY_COLOR,
        outlineColor: "transparent",
        outlineStyle: "none",
        outlineWidth: 0,
      },
      default: {},
    }),
  },
  inputFocused: {
    borderColor: PRIMARY_COLOR,
  },
  inputError: {
    borderColor: "#ff4d4d",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 12,
    fontWeight: "600",
  },
  phoneFields: {
    flexDirection: "row",
    gap: 8,
  },
  mobileInput: {
    flex: 1,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 64,
  },
  passwordToggle: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordToggleText: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "800",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#e65539",
    fontSize: 13,
    fontWeight: "700",
    marginTop: -4,
  },
  resetPasswordForm: {
    gap: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  resetHeader: {
    gap: 8,
  },
  resetTitle: {
    color: "#111111",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  resetSubtitle: {
    color: "#333333",
    fontSize: 16,
    lineHeight: 22,
  },
  backToLoginButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backToLoginText: {
    color: "#d96a5d",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eeeeee",
  },
  dividerText: {
    paddingHorizontal: 10,
    color: "#999999",
    fontSize: 12,
    fontWeight: "700",
  },
  linkButton: {
    color: "#e65539",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 2,
  },
  linkButtonDisabled: {
    opacity: 0.65,
  },
  otpContainer: {
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  otpInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  otpInputsLarge: {
    gap: 6,
    marginBottom: 26,
  },
  otpInputField: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    fontSize: 20,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "transparent",
    color: "#111111",
    textAlign: "center",
    textAlignVertical: "center",
    ...Platform.select({
      web: {
        caretColor: PRIMARY_COLOR,
        outlineColor: "transparent",
        outlineStyle: "none",
        outlineWidth: 0,
      },
      default: {},
    }),
  },
  otpInputFieldLarge: {
    minHeight: 50,
    borderRadius: 12,
    fontSize: 20,
  },
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  otpCard: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  otpTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    color: "#111111",
  },
  resetOtpTitle: {
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 18,
  },
  otpSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  resetOtpSubtitle: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  popupButtonGroup: {
    gap: 12,
    marginTop: 6,
  },
  authToast: {
    width: "100%",
    maxWidth: 420,
    marginBottom: 16,
  },
});
