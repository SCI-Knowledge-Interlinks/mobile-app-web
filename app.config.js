const IS_DEV_CLIENT =
  process.env.EAS_BUILD_PROFILE !== "preview" &&
  process.env.EAS_BUILD_PROFILE !== "production";

const DEFAULT_API_BASE_URL = "https://azure-cassowary-742969.hostingersite.com";
const DEFAULT_EXHIBITOR_LIST_URL =
  "https://prawaas.com/prawaas-2026/public/api/public/exhibitor-list";

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Prawaas",
    slug: "prawaas-project",
    version: "1.0.0",
    orientation: "portrait",
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
      appEnv: {
        apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL,
        eventId: process.env.EXPO_PUBLIC_EVENT_ID || "1",
        appName: process.env.EXPO_PUBLIC_APP_NAME || "Prawaas",
        exhibitorListUrl:
          process.env.EXPO_PUBLIC_EXHIBITOR_LIST_URL || DEFAULT_EXHIBITOR_LIST_URL,
        firebaseVapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY || "",
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
