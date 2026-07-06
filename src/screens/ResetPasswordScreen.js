import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
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
import AuthButton from "../components/AuthButton";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { fontFamily } from "../constants/typography";
import { confirmPasswordReset } from "../services/authService";
import { getApiErrorMessage, isNoInternetError } from "../utils/network";
import { isValidPassword } from "../validations/authValidations";

export default function ResetPasswordScreen({
  email = "",
  requestId = "",
  code = "",
  otp = "",
  onBack,
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 400);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (!isValidPassword(newPassword)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      await confirmPasswordReset({
        requestId: String(requestId).trim(),
        code: String(code || otp).trim(),
        password: newPassword.trim(),
      });

      setSuccessMessage("Password reset successfully. You can sign in now.");
      setTimeout(() => {
        router.replace("/sign-in-email");
      }, 1500);
    } catch (err) {
      setError(isNoInternetError(err) ? "No internet connection." : getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <AppStatusBar />
      <AuthBrandHeader onBack={onBack} />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainContent, { width: contentWidth }]}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderIcon}>
              <Ionicons name="key-outline" size={24} color={colors.primaryBlue} />
            </View>
            <View style={styles.formHeaderCopy}>
              <Text style={styles.formTitle}>Set new password</Text>
              <Text style={styles.formSubtitle}>
                Create a new password for{" "}
                <Text style={styles.emailHighlight}>{String(email).trim()}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.formBlock}>
            <LabeledField label="New password">
              <PasswordInput
                value={newPassword}
                onChangeText={(value) => {
                  setNewPassword(value);
                  setError("");
                  setSuccessMessage("");
                }}
                showPassword={showNewPassword}
                onToggle={() => setShowNewPassword((current) => !current)}
                placeholder="Enter new password"
                hasError={!!error}
              />
            </LabeledField>

            <LabeledField label="Confirm password">
              <PasswordInput
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setError("");
                  setSuccessMessage("");
                }}
                showPassword={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((current) => !current)}
                placeholder="Re-enter new password"
                hasError={!!error}
              />
            </LabeledField>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

            <AuthButton
              title="Reset Password"
              onPress={handleReset}
              loading={isSubmitting}
              disabled={isSubmitting || !!successMessage}
            />
          </View>
        </View>
      </ScrollView>
    </View>
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

function PasswordInput({
  value,
  onChangeText,
  showPassword,
  onToggle,
  placeholder,
  hasError,
}) {
  return (
    <View style={styles.passwordRow}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={placeholder}
        style={[styles.input, styles.passwordInput, hasError && styles.inputError]}
        placeholderTextColor={colors.muted}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mainScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  mainContent: {
    alignSelf: "center",
    gap: 28,
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
    backgroundColor: "#E9EDF8",
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
  emailHighlight: {
    color: colors.text,
    fontFamily: fontFamily.bold,
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
  successText: {
    color: colors.success,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
