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
import CountryCodePicker from "../components/CountryCodePicker";
import { colors } from "../constants/colors";
import { defaultCountryCode } from "../constants/countryCodes";
import { spacing } from "../constants/spacing";
import { fontFamily } from "../constants/typography";
import { loginWithMobile, sendLoginOtp } from "../services/authService";
import { saveAuthSession } from "../services/sessionService";
import { trackEventJourneyActivity } from "../services/eventJourneyTracker";
import { getApiErrorMessage, isNoInternetError } from "../utils/network";
import { isValidPassword, validateMobileWithCountryCode } from "../validations/authValidations";

const STEPS = {
  choose: "choose",
  password: "password",
  otp: "otp",
};

export default function SignInMobile({ onBack }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 400);

  const [step, setStep] = useState(STEPS.choose);
  const [countryCode, setCountryCode] = useState(defaultCountryCode.dialCode);
  const [countryIso, setCountryIso] = useState(defaultCountryCode.iso);
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordStep = step === STEPS.password;
  const isOtpStep = step === STEPS.otp;

  const handleBack = () => {
    if (step === STEPS.choose) {
      onBack?.();
      return;
    }

    setStep(STEPS.choose);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const validateMobile = () => {
    const validationError = validateMobileWithCountryCode(countryCode, mobileNumber);
    if (validationError) {
      setError(validationError);
      return false;
    }

    return true;
  };

  const handlePasswordLogin = async () => {
    if (!validateMobile()) return;

    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const authData = await loginWithMobile({
        countryCode,
        mobileNumber: mobileNumber.trim(),
        password: password.trim(),
      });
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
    if (!validateMobile()) return;

    try {
      setIsSubmitting(true);
      setError("");

      const response = await sendLoginOtp({
        channel: "whatsapp",
        countryCode,
        mobile: mobileNumber.trim(),
        page: "sign_in",
      });

      if (!response?.requestId) {
        throw new Error("OTP request failed. Missing requestId.");
      }

      router.push({
        pathname: "/otp",
        params: {
          channel: "mobile",
          countryCode,
          mobileNumber: mobileNumber.trim(),
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
            ) : (
              <FormView
                isPasswordStep={isPasswordStep}
                isOtpStep={isOtpStep}
                countryCode={countryCode}
                countryIso={countryIso}
                mobileNumber={mobileNumber}
                password={password}
                showPassword={showPassword}
                error={error}
                isSubmitting={isSubmitting}
                onCountrySelect={(country) => {
                  setCountryCode(country.dialCode);
                  setCountryIso(country.iso);
                  setError("");
                }}
                onMobileChange={(value) => {
                  setMobileNumber(value.replace(/\D/g, ""));
                  setError("");
                }}
                onPasswordChange={(value) => {
                  setPassword(value);
                  setError("");
                }}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onSubmit={isPasswordStep ? handlePasswordLogin : handleSendOtp}
                onSwitchMethod={isPasswordStep ? switchToOtp : switchToPassword}
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
        <Text style={styles.title}>Sign in with Mobile</Text>
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
          icon="phone-portrait-outline"
          title="Sign in with Mobile OTP"
          subtitle="Receive a 6-digit code on WhatsApp"
          onPress={onSelectOtp}
        />
      </View>
    </>
  );
}

function FormView({
  isPasswordStep,
  isOtpStep,
  countryCode,
  countryIso,
  mobileNumber,
  password,
  showPassword,
  error,
  isSubmitting,
  onCountrySelect,
  onMobileChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onSwitchMethod,
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
            name={isPasswordStep ? "lock-closed-outline" : "phone-portrait-outline"}
            size={24}
            color={colors.primaryBlue}
          />
        </View>
        <View style={styles.formHeaderCopy}>
          <Text style={styles.formTitle}>
            {isPasswordStep ? "Password sign in" : "Mobile OTP sign in"}
          </Text>
          <Text style={styles.formSubtitle}>
            {isPasswordStep
              ? "Enter your registered mobile number and password."
              : "Enter your mobile number and we will send a one-time code."}
          </Text>
        </View>
      </View>

      {isOtpStep ? (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primaryBlue} />
          <Text style={styles.infoCardText}>
            A 6-digit OTP will be sent to your WhatsApp. It expires in 5 minutes.
          </Text>
        </View>
      ) : null}

      <View style={styles.formBlock}>
        <LabeledField label="Mobile number">
          <View style={styles.phoneRow}>
            <CountryCodePicker
              selectedCode={countryCode}
              selectedIso={countryIso}
              onSelect={onCountrySelect}
            />
            <TextInput
              value={mobileNumber}
              onChangeText={onMobileChange}
              keyboardType="phone-pad"
              placeholder="Enter mobile number"
              style={[styles.input, styles.phoneInput, error ? styles.inputError : null]}
              placeholderTextColor={colors.muted}
            />
          </View>
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
          {isPasswordStep ? "Sign in with Mobile OTP instead" : "Sign in with Password instead"}
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  phoneInput: {
    flex: 1,
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
});
