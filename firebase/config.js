import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";

function readConfig() {
  const extra = Constants.expoConfig?.extra || {};

  return {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.firebaseApiKey || "",
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      extra.firebaseAuthDomain ||
      "",
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
      extra.firebaseProjectId ||
      "",
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      extra.firebaseStorageBucket ||
      "",
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      extra.firebaseMessagingSenderId ||
      "",
    appId:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.firebaseAppId || "",
    measurementId:
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
      extra.firebaseMeasurementId ||
      "",
  };
}

export const firebaseConfig = readConfig();

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
].filter((key) => !firebaseConfig[key]);

export const firebaseReady = requiredKeys.length === 0;

let app = null;
let auth = null;
let db = null;
let storage = null;

if (firebaseReady) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
  }

  db = getFirestore(app);
  storage = getStorage(app);
} else if (__DEV__) {
  console.warn(
    `Firebase is disabled. Missing env keys: ${requiredKeys.join(", ")}`
  );
}

export { app, auth, db, storage };
