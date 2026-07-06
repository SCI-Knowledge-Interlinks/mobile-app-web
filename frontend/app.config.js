const IS_DEV_CLIENT =
  process.env.EAS_BUILD_PROFILE !== "preview" &&
  process.env.EAS_BUILD_PROFILE !== "production";

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Prawaas",
    slug: "prawaas-project",
    version: "1.0.0",
    orientation: "portrait",
    // Centered + padded for launcher safe-zone (avoids stretch/crop on Android).
    icon: "./src/assets/adaptive-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      backgroundColor: "#000227",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.boci.prawaas",
      infoPlist: {
        NSCameraUsageDescription:
          "Allow Prawaas to scan registration badge QR codes with your camera.",
      },
    },
    android: {
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./src/assets/adaptive-icon.png",
        backgroundColor: "#000227",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.POST_NOTIFICATIONS",
      ],
      package: "com.boci.prawaas",
    },
    web: {
      favicon: "./src/assets/icon.png",
      backgroundColor: "#000227",
    },
    extra: {
      eas: {
        projectId: "86020fd4-920b-478a-8998-1200b6b1d001",
      },
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./src/assets/icon.png",
          color: "#000227",
        },
      ],
      "expo-router",
      ...(IS_DEV_CLIENT ? ["expo-dev-client"] : []),
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Prawaas to choose a profile photo from your gallery.",
          cameraPermission: "Allow Prawaas to capture a profile photo.",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow Prawaas to scan registration badge QR codes with your camera.",
          recordAudioAndroid: false,
        },
      ],
      "expo-secure-store",
      "expo-font",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            useLegacyPackaging: true,
          },
        },
      ],
    ],
  },
};
