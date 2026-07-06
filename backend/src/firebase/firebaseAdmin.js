const fs = require("fs");
const path = require("path");
const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

function resolveServiceAccountPath() {
  const configured = String(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "").trim();
  if (configured) {
    return path.resolve(configured);
  }

  const candidates = [
    path.resolve(__dirname, "../../secrets/firebase-service-account.json"),
    path.resolve(__dirname, "serviceAccountKey.json"),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    try {
      const contents = fs.readFileSync(candidate, "utf8").trim();
      if (contents) {
        JSON.parse(contents);
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }

  return candidates[0];
}

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountPath = resolveServiceAccountPath();
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase service account not found at ${serviceAccountPath}. Set FIREBASE_SERVICE_ACCOUNT_PATH.`
    );
  }

  const serviceAccount = require(serviceAccountPath);
  return initializeApp({
    credential: cert(serviceAccount),
  });
}

async function sendPushNotification({ token, title, body, data = {} }) {
  if (!token) {
    throw new Error("FCM token is required");
  }

  return getMessaging(getFirebaseApp()).send({
    token,
    notification: {
      title: title || "Prawaas",
      body: body || "",
    },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value ?? "")])
    ),
  });
}

module.exports = {
  getFirebaseApp,
  sendPushNotification,
};
