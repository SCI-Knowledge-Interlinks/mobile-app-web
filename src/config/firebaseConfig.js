export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA2SL8Xm31-0ptdshYrDq1frukM65if3vI",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "prawaas-650d0.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "prawaas-650d0",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "prawaas-650d0.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1003791871854",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:1003791871854:web:60bb88daaa908e5b1fdb7f",
};

export const firebaseVapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY || "";
