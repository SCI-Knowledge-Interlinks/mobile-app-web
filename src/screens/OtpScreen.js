import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

import AuthBrandHeader from "../components/AuthBrandHeader";
import AuthButton from "../components/AuthButton";
import { colors } from "../constants/colors";
import { MOBILE_MAX_WIDTH } from "../constants/layout";
import { fontFamily } from "../constants/typography";
import { useTopSafeInset } from "../hooks/useTopSafeInset";
import { commonStyles } from "../styles/commonStyles";
import {
  requestPasswordReset,
  sendLoginOtp,
  verifyLoginOtp,
} from "../services/authService";
import { saveAuthSession } from "../services/sessionService";
import { trackEventJourneyActivity } from "../services/eventJourneyTracker";
import { getApiErrorMessage, isNoInternetError } from "../utils/network";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const emptyOtp = () => Array(OTP_LENGTH).fill("");

function formatMobileTarget(countryCode, mobileNumber) {
  const digits = String(mobileNumber || "").replace(/\D/g, "");
  if (digits.length <= 5) {
    return `${countryCode} ${digits}`;
  }

  return `${countryCode} ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function formatTimer(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}.${remainder}`;
}

export default function OtpScreen({
  channel = "mobile",
  email = "",
  countryCode = "+91",
  mobileNumber = "",
  requestId = "",
  purpose = "login_email_otp",
  onBack,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = useTopSafeInset();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, MOBILE_MAX_WIDTH - 40, 400);
  const otpRefs = useRef({});

  const isMobile = channel === "mobile";
  const isResetPassword = purpose === "reset_password_email_otp";
  const targetLabel = isMobile
    ? formatMobileTarget(countryCode, mobileNumber)
    : String(email).trim();

  const [otpRequestId, setOtpRequestId] = useState(requestId);
  const [otp, setOtp] = useState(emptyOtp);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [message, setMessage] = useState(
    isMobile
      ? "OTP sent to your mobile successfully."
      : isResetPassword
        ? "Reset code sent to your email successfully."
        : "OTP sent to your email successfully."
  );
  const [messageType, setMessageType] = useState("success");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (requestId) {
      setOtpRequestId(requestId);
    }
  }, [requestId]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const updateOtp = (value, index) => {
    const nextOtp = [...otp];
    const nextDigit = value.replace(/\D/g, "").slice(0, 1);
    nextOtp[index] = nextDigit;
    setOtp(nextOtp);
    setMessage("");

    if (nextDigit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus?.();
    }
  };

  const handleOtpKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus?.();
    }
  };

  const handleResend = async () => {
    if (isResending || secondsLeft > 0) return;

    try {
      setIsResending(true);
      setMessage("");

      if (isMobile) {
        const response = await sendLoginOtp({
          channel: "whatsapp",
          countryCode,
          mobile: String(mobileNumber).trim(),
          page: "sign_in",
        });
        if (!response.requestId) {
          throw new Error("OTP request failed. Please try again.");
        }
        setOtpRequestId(response.requestId);
        setMessage("OTP sent to your mobile successfully.");
      } else if (isResetPassword) {
        const response = await requestPasswordReset({
          channel: "email",
          email: String(email).trim(),
        });
        if (!response?.requestId) {
          throw new Error("Password reset request failed. Please try again.");
        }
        setOtpRequestId(response.requestId);
        setMessage("Reset code sent to your email successfully.");
      } else {
        const response = await sendLoginOtp({
          channel: "email",
          email: String(email).trim(),
          page: "sign_in",
        });
        if (!response.requestId) {
          throw new Error("OTP request failed. Please try again.");
        }
        setOtpRequestId(response.requestId);
        setMessage("OTP sent to your email successfully.");
      }

      setMessageType("success");
      setOtp(emptyOtp());
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setMessageType("error");
      setMessage(isNoInternetError(err) ? "No internet connection." : getApiErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      setMessageType("error");
      setMessage("Please enter all 6 OTP digits.");
      return;
    }

    try {
      setIsVerifying(true);
      setMessage("");

      if (isResetPassword) {
        if (!otpRequestId) {
          setMessageType("error");
          setMessage("Reset session expired. Please request a new code.");
          return;
        }

        router.replace({
          pathname: "/reset-password",
          params: {
            email: String(email).trim(),
            requestId: otpRequestId,
            code: otpValue,
          },
        });
        return;
      }

      if (!otpRequestId) {
        setMessageType("error");
        setMessage("OTP session expired. Please request a new code.");
        return;
      }

      const authData = await verifyLoginOtp({
        requestId: otpRequestId,
        otp: otpValue,
      });

      await saveAuthSession(authData);
      await trackEventJourneyActivity("login");
      router.replace("/login-success");
    } catch (err) {
      setMessageType("error");
      setMessage(isNoInternetError(err) ? "No internet connection." : getApiErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: topInset, paddingBottom: insets.bottom }]}>
      <AuthBrandHeader onBack={onBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.mainContent, { width: contentWidth }]}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>
              {isMobile ? "Verify Mobile" : isResetPassword ? "Verify Reset Code" : "Verify Email"}
            </Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit {isResetPassword ? "code" : "OTP"} sent to{" "}
              <Text style={styles.subtitleTarget}>{targetLabel}</Text>
            </Text>
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  otpRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => updateOtp(value, index)}
                onKeyPress={(event) => handleOtpKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectionColor={colors.primaryBlue}
                cursorColor={colors.primaryBlue}
                style={styles.otpInput}
              />
            ))}
          </View>

          {message ? (
            <Text
              style={[
                styles.feedbackText,
                messageType === "error" ? styles.feedbackError : styles.feedbackSuccess,
              ]}
            >
              {message}
            </Text>
          ) : null}

          <View style={styles.resendBlock}>
            {secondsLeft > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {formatTimer(secondsLeft)}</Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator color={colors.primaryBlue} />
                ) : (
                  <Text style={styles.resendButton}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <AuthButton
            title="Verify"
            onPress={handleVerify}
            loading={isVerifying}
            disabled={isVerifying}
            style={styles.verifyButton}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  mainContent: {
    alignSelf: "center",
    gap: 20,
  },
  titleBlock: {
    width: "100%",
    gap: 8,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  subtitleTarget: {
    color: colors.text,
    fontFamily: fontFamily.bold,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  otpInput: {
    flex: 1,
    maxWidth: 48,
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b7b8bc",
    backgroundColor: "#FFFFFF",
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    ...commonStyles.webInputReset,
    ...Platform.select({
      web: {
        height: 52,
        lineHeight: 52,
        paddingVertical: 0,
        paddingHorizontal: 0,
        textAlign: "center",
      },
    }),
  },
  feedbackText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  feedbackSuccess: {
    color: colors.success,
  },
  feedbackError: {
    color: colors.danger,
  },
  resendBlock: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    color: colors.muted,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  resendButton: {
    color: colors.primaryBlue,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  verifyButton: {
    marginTop: 8,
  },
});
