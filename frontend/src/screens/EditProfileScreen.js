import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { Button, Card, Header, Input, Toast } from "../components";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import {
  isValidEmail,
  isValidMobile,
  isValidName,
  isValidPincode,
} from "../validations/authValidations";

const genders = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

function getInitialForm(user = {}) {
  return {
    name: user.name || "",
    email: user.email || "",
    countryCode: user.countryCode || "+91",
    mobileNumber: user.mobileNumber || "",
    designation: user.designation || "",
    company: user.company || "",
    gender: user.gender || "",
    country: user.country || "",
    city: user.city || "",
    pincode: user.pincode || "",
  };
}

export default function EditProfileScreen({
  initialUser = {},
  onBack,
  onSave,
  onSaveSuccess,
}) {
  const { width } = useWindowDimensions();
  const contentWidth = useMemo(() => Math.min(width - 24, 720), [width]);
  const initialForm = useMemo(() => getInitialForm(initialUser), [initialUser]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasSavedMobile = isValidMobile(initialForm.mobileNumber);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!isValidName(form.name)) nextErrors.name = "Enter a valid name.";
    if (!isValidEmail(form.email)) nextErrors.email = "Enter a valid email.";
    if (!isValidMobile(form.mobileNumber)) {
      nextErrors.mobileNumber = "Enter a valid mobile number.";
    }
    if (form.pincode && !isValidPincode(form.pincode)) {
      nextErrors.pincode = "Enter a valid pincode.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveProfile = async () => {
    if (isSaving || !validate()) return;

    try {
      setIsSaving(true);
      setMessage("");
      const savedUser = await onSave(form);
      setMessage("Profile saved successfully.");
      onSaveSuccess(savedUser);
    } catch (error) {
      setMessage(error.message || "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.profilePage}>
          <Header title="Edit Profile" onBack={onBack} contentWidth={contentWidth} />

          <View style={[styles.content, { maxWidth: contentWidth }]}>
            <Toast message={message} onClose={() => setMessage("")} />

            <Card style={styles.formCard}>
            <Input
              label="Name"
              value={form.name}
              error={errors.name}
              onChangeText={(value) => updateField("name", value)}
            />
            <Input
              label="Email"
              value={form.email}
              error={errors.email}
              editable={false}
              autoCapitalize="none"
              keyboardType="email-address"
              inputStyle={styles.disabledInput}
              onChangeText={(value) => updateField("email", value)}
            />
            <View style={styles.phoneRow}>
              <Input
                label="Code"
                value={form.countryCode}
                editable={!hasSavedMobile}
                inputStyle={hasSavedMobile && styles.disabledInput}
                onChangeText={(value) => updateField("countryCode", value)}
                style={styles.countryInput}
              />
              <Input
                label="Mobile"
                value={form.mobileNumber}
                error={errors.mobileNumber}
                editable={!hasSavedMobile}
                keyboardType="phone-pad"
                inputStyle={hasSavedMobile && styles.disabledInput}
                onChangeText={(value) =>
                  updateField("mobileNumber", value.replace(/\D/g, ""))
                }
                style={styles.mobileInput}
              />
            </View>
            <Input
              label="Designation"
              value={form.designation}
              onChangeText={(value) => updateField("designation", value)}
            />
            <Input
              label="Company"
              value={form.company}
              onChangeText={(value) => updateField("company", value)}
            />

            <View style={styles.genderGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {genders.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.8}
                    onPress={() => updateField("gender", item.value)}
                    style={[
                      styles.genderButton,
                      form.gender === item.value && styles.genderButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        form.gender === item.value && styles.genderTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Country"
              value={form.country}
              onChangeText={(value) => updateField("country", value)}
            />
            <Input
              label="City"
              value={form.city}
              onChangeText={(value) => updateField("city", value)}
            />
            <Input
              label="Pincode"
              value={form.pincode}
              error={errors.pincode}
              keyboardType="number-pad"
              onChangeText={(value) =>
                updateField("pincode", value.replace(/\D/g, "").slice(0, 10))
              }
            />

            <Button
              title={isSaving ? "Saving..." : "Save"}
              disabled={isSaving}
              onPress={saveProfile}
            />
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  profilePage: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: colors.background,
    paddingBottom: 44,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    gap: 12,
    paddingHorizontal: 14,
    marginTop: -60,
  },
  formCard: {
    gap: 17,
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 22,
  },
  phoneRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  countryInput: {
    flex: 0.35,
  },
  mobileInput: {
    flex: 0.65,
  },
  disabledInput: {
    backgroundColor: "#EEF2F6",
    color: colors.muted,
  },
  genderGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  genderRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  genderTextActive: {
    color: colors.primary,
  },
});
