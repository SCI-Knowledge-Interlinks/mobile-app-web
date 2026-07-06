import { initializeApp, getApps, getApp } from "firebase/app";

import { firebaseConfig } from "../config/firebaseConfig";

let firebaseApp = null;

export function getFirebaseApp() {
  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
}
