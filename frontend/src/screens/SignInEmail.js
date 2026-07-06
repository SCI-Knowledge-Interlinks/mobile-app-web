import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
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

import AppStatusBar from "../components/AppStatusBar";
import AuthBrandHeader from "../components/AuthBrandHeader";
import AuthButton, { AuthMethodCard } from "../components/AuthButton";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { fontFamily } from "../constants/typography";
import { loginWithEmail, requestPasswordReset, sendLoginOtp } from "../services/authService";
import { saveAuthSession } from "../services/sessionService";
import { trackEventJourneyActivity } from "../services/eventJourneyTracker";
import { getApiErrorMessage, isNoInternetError } from "../utils/network";
import { isValidEmail, isValidPassword } from "../validations/authValidations";

const STEPS = {
  choose: "choose",
  password: "password",
  otp: "otp",
  forgot: "forgot",
};

const RESET_PASSWORD_PURPOSE = "reset_password_email_otp";

export default function SignInEmail({ onBack }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 400);

  const [step, setStep] = useState(STEPS.choose);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordStep = step === STEPS.password;
  const isOtpStep = step === STEPS.otp;
  const isForgotStep = step === STEPS.forgot;

  const handleBack = () => {
    if (step === STEPS.choose) {
      onBack?.();
      return;
    }

    if (step === STEPS.forgot) {
      setStep(STEPS.password);
      setError("");
      return;
    }

    setStep(STEPS.choose);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const handlePasswordLogin = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const authData = await loginWithEmail(email.trim(), password.trim());
      await saveAuthSession(authData);
      await trackEventJourneyActivity("login");
      router.replace("/login-success");
    } catch (err) {
      setError(isNoInternetError(err) ? "No internet connection." : getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await sendLoginOtp({
        channel: "email",
        email: email.trim(),
        page: "sign_in",
      });

      if (!response?.requestId) {
        throw new Error("OTP request failed. Missing requestId.");
      }

      router.push({
        pathname: "/otp",
        params: {
          channel: "email",
          email: email.trim(),
          requestId: response.requestId,
        },
      });
    } catch (err) {
      setError(isNoInternetError(err) ? "No internet connection." : getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToPassword = () => {
    setStep(STEPS.password);
    setError("");
    setPassword("");
  };

  const switchToOtp = () => {
    setStep(STEPS.otp);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const switchToForgot = () => {
    setStep(STEPS.forgot);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const handleSendResetCode = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await requestPasswordReset({
        channel: "email",
        email: email.trim(),
      });

      if (!response?.requestId) {
        throw new Error("Password reset request failed. Missing requestId.");
      }

      router.push({
        pathname: "/otp",
        params: {
          channel: "email",
          email: email.trim(),
          requestId: response.requestId,
          purpose: RESET_PASSWORD_PURPOSE,
        },
      });
    } catch (err) {
      setError(isNoInternetError(err) ? "No internet connection." : getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <AppStatusBar />
      <AuthBrandHeader onBack={handleBack} />

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
            {step === STEPS.choose ? (
              <ChooseMethodView onSelectPassword={switchToPassword} onSelectOtp={switchToOtp} />
            ) : isForgotStep ? (
              <ForgotPasswordView
                email={email}
                error={error}
                isSubmitting={isSubmitting}
                onEmailChange={(value) => {
                  setEmail(value);
                  setError("");
                }}
                onSubmit={handleSendResetCode}
                onBackToSignIn={() => {
                  setStep(STEPS.password);
                  setError("");
                }}
              />
            ) : (
              <FormView
                isPasswordStep={isPasswordStep}
                isOtpStep={isOtpStep}
                email={email}
                password={password}
                showPassword={showPassword}
                error={error}
                isSubmitting={isSubmitting}
                onEmailChange={(value) => {
                  setEmail(value);
                  setError("");
                }}
                onPasswordChange={(value) => {
                  setPassword(value);
                  setError("");
                }}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onSubmit={isPasswordStep ? handlePasswordLogin : handleSendOtp}
                onSwitchMethod={isPasswordStep ? switchToOtp : switchToPassword}
                onForgotPassword={switchToForgot}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ChooseMethodView({ onSelectPassword, onSelectOtp }) {
  return (
    <>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Sign in with Email</Text>
        <Text style={styles.subtitle}>Choose how you would like to continue</Text>
      </View>

      <View style={styles.methodList}>
        <AuthMethodCard
          icon="lock-closed-outline"
          title="Sign in with Password"
          subtitle="Use the password linked to your account"
          onPress={onSelectPassword}
        />
        <AuthMethodCard
          icon="mail-unread-outline"
          title="Sign in with Email OTP"
          subtitle="Receive a 6-digit code on your email"
          onPress={onSelectOtp}
        />
      </View>
    </>
  );
}

function ForgotPasswordView({
  email,
  error,
  isSubmitting,
  onEmailChange,
  onSubmit,
  onBackToSignIn,
}) {
  return (
    <>
      <View style={styles.formHeader}>
        <View style={[styles.formHeaderIcon, styles.formHeaderIconPassword]}>
          <Ionicons name="key-outline" size={24} color={colors.primaryBlue} />
        </View>
        <View style={styles.formHeaderCopy}>
          <Text style={styles.formTitle}>Forgot password</Text>
          <Text style={styles.formSubtitle}>
            Enter your registered email and we will send a reset code.
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primaryBlue} />
        <Text style={styles.infoCardText}>
          A 6-digit code will be sent to your email. It expires in 5 minutes.
        </Text>
      </View>

      <View style={styles.formBlock}>
        <LabeledField label="Email address">
          <TextInput
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="name@example.com"
            style={[styles.input, error ? styles.inputError : null]}
            placeholderTextColor={colors.muted}
          />
        </LabeledField>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AuthButton
          title="Send Reset Code"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onBackToSignIn} style={styles.switchMethodWrap}>
        <Text style={styles.switchMethodText}>Back to password sign in</Text>
      </TouchableOpacity>
    </>
  );
}

function FormView({
  isPasswordStep,
  isOtpStep,
  email,
  password,
  showPassword,
  error,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onSwitchMethod,
  onForgotPassword,
}) {
  return (
    <>
      <View style={styles.formHeader}>
        <View
          style={[
            styles.formHeaderIcon,
            isOtpStep ? styles.formHeaderIconOtp : styles.formHeaderIconPassword,
          ]}
        >
          <Ionicons
            name={isPasswordStep ? "lock-closed-outline" : "mail-unread-outline"}
            size={24}
            color={colors.primaryBlue}
          />
        </View>
        <View style={styles.formHeaderCopy}>
          <Text style={styles.formTitle}>
            {isPasswordStep ? "Password sign in" : "Email OTP sign in"}
          </Text>
          <Text style={styles.formSubtitle}>
            {isPasswordStep
              ? "Enter your registered email and password."
              : "Enter your email and we will send a one-time code."}
          </Text>
        </View>
      </View>

      {isOtpStep ? (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primaryBlue} />
          <Text style={styles.infoCardText}>
            A 6-digit OTP will be sent to your email. It expires in 5 minutes.
          </Text>
        </View>
      ) : null}

      <View style={styles.formBlock}>
        <LabeledField label="Email address">
          <TextInput
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="name@example.com"
            style={[styles.input, error ? styles.inputError : null]}
            placeholderTextColor={colors.muted}
          />
        </LabeledField>

        {isPasswordStep ? (
          <LabeledField label="Password">
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={onPasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter your password"
                style={[styles.input, styles.passwordInput, error ? styles.inputError : null]}
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onTogglePassword}
                style={styles.passwordToggle}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onForgotPassword}
              style={styles.forgotPasswordWrap}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </LabeledField>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AuthButton
          title={isPasswordStep ? "Sign In" : "Send OTP"}
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onSwitchMethod} style={styles.switchMethodWrap}>
        <Text style={styles.switchMethodText}>
          {isPasswordStep ? "Sign in with Email OTP instead" : "Sign in with Password instead"}
        </Text>
      </TouchableOpacity>
    </>
  );
}

function LabeledField({ label, children }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
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
    gap: 28,
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
    lineHeight: 22,
  },
  methodList: {
    width: "100%",
    gap: 16,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 4,
  },
  formHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  formHeaderIconPassword: {
    backgroundColor: "#E9EDF8",
  },
  formHeaderIconOtp: {
    backgroundColor: "#EAF3FF",
  },
  formHeaderCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  formTitle: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
  },
  formSubtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.pageBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  infoCardText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  formBlock: {
    width: "100%",
    gap: 16,
  },
  fieldWrap: {
    width: "100%",
    gap: 8,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  input: {
    width: "100%",
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#b7b8bc",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  passwordRow: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    paddingRight: 52,
  },
  passwordToggle: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  switchMethodWrap: {
    alignItems: "center",
    paddingVertical: 4,
  },
  switchMethodText: {
    color: colors.primaryBlue,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  forgotPasswordWrap: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotPasswordText: {
    color: colors.primaryBlue,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 18,
  },
});
