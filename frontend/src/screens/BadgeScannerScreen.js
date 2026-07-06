import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuthButton from "../components/AuthButton";
import ScreenPageHeader from "../components/ScreenPageHeader";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { textPresets } from "../constants/typography";
import { commonStyles } from "../styles/commonStyles";
import { resolveBadgeFromScan } from "../utils/badgeResolver";
import { getApiErrorMessage } from "../utils/network";

export default function BadgeScannerScreen({
  user = {},
  isProcessing = false,
  onBack,
  onBadgeScanned,
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanLocked, setIsScanLocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const processingRef = useRef(false);

  const handleBarcodeScanned = useCallback(
    async ({ data }) => {
      if (!isCameraReady || isScanLocked || processingRef.current || isProcessing) {
        return;
      }

      processingRef.current = true;
      setIsScanLocked(true);
      setErrorMessage("");
      setStatusMessage("Registration ID found. Loading badge...");

      try {
        const badge = await resolveBadgeFromScan({
          rawValue: data,
          userId: user?.id,
        });

        setStatusMessage("Badge loaded successfully.");
        onBadgeScanned?.(badge);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
        setStatusMessage("");
        setIsScanLocked(false);
      } finally {
        processingRef.current = false;
      }
    },
    [isCameraReady, isProcessing, isScanLocked, onBadgeScanned, user?.id]
  );

  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();
    if (!result.granted) {
      setErrorMessage("Camera access is required to scan registration badge QR codes.");
    }
  }, [requestPermission]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  if (Platform.OS === "web") {
    return (
      <View style={commonStyles.newScreenAlt}>
        <ScreenPageHeader
          title="Badge Scanner"
          onBack={onBack}
          backgroundColor={colors.pageBackgroundAlt}
        />
        <View style={styles.centeredContent}>
          <Text style={styles.helperText}>
            Camera scanning is available on Android and iOS devices. Open this screen on a phone or
            tablet to scan your registration QR code.
          </Text>
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={commonStyles.newScreenAlt}>
        <ScreenPageHeader
          title="Badge Scanner"
          onBack={onBack}
          backgroundColor={colors.pageBackgroundAlt}
        />
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={colors.brandBlue} />
          <Text style={styles.helperText}>Checking camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={commonStyles.newScreenAlt}>
        <ScreenPageHeader
          title="Badge Scanner"
          onBack={onBack}
          backgroundColor={colors.pageBackgroundAlt}
        />
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Camera permission needed</Text>
          <Text style={styles.helperText}>
            Allow camera access to scan the registration QR code from your confirmation details.
          </Text>
          {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          <AuthButton title="Allow Camera Access" onPress={handleRequestPermission} />
          <AuthButton
            title="Open Settings"
            onPress={handleOpenSettings}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus="on"
        onCameraReady={() => setIsCameraReady(true)}
        onBarcodeScanned={
          isCameraReady && !isScanLocked && !isProcessing ? handleBarcodeScanned : undefined
        }
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBack}
            style={styles.cameraBackButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.cameraHeaderTitle}>Badge Scanner</Text>
          <View style={styles.cameraBackButton} />
        </View>

        <View style={styles.scannerBody}>
          <Text style={styles.instructionText}>
            Align the registration QR code inside the frame
          </Text>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          <Text style={styles.hintText}>
            The QR contains your REG-ID (for example, PWS-OPE-0001).
          </Text>

          {isProcessing || isScanLocked ? (
            <View style={styles.statusCard}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.statusText}>
                {statusMessage || "Processing badge..."}
              </Text>
            </View>
          ) : null}

          {!!errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <AuthButton
                title="Scan Again"
                onPress={() => {
                  setErrorMessage("");
                  setStatusMessage("");
                  setIsScanLocked(false);
                }}
                style={styles.scanAgainButton}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const FRAME_SIZE = 260;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  scannerBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  centeredContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...textPresets.sectionTitle,
    color: colors.text,
    textAlign: "center",
  },
  helperText: {
    ...textPresets.bodyMedium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  instructionText: {
    ...textPresets.bodyMedium,
    color: colors.white,
    textAlign: "center",
  },
  hintText: {
    ...textPresets.bodyMedium,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: colors.white,
  },
  cornerTopLeft: {
    top: 12,
    left: 12,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 12,
    right: 12,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  statusCard: {
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusText: {
    ...textPresets.bodyMedium,
    color: colors.white,
    textAlign: "center",
  },
  errorCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    ...textPresets.bodyMedium,
    color: "#C62828",
    textAlign: "center",
  },
  cameraHeader: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  cameraBackButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraHeaderTitle: {
    flex: 1,
    textAlign: "center",
    ...textPresets.pageHeaderTitle,
    color: colors.white,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
  scanAgainButton: {
    marginTop: spacing.xs,
  },
});
