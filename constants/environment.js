import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || {};

export const APP_ENVIRONMENT =
  String(extra.environmentName || process.env.EXPO_PUBLIC_APP_ENVIRONMENT || "development").trim() ||
  "development";

export const isDevelopment = APP_ENVIRONMENT === "development";
export const isProduction = APP_ENVIRONMENT === "production";

export function getPublicEnvironment(key, fallback = "") {
  const value = extra[key] ?? process.env[key];
  return String(value ?? fallback).trim();
}

export function getEnvironmentConfig() {
  return {
    appEnvironment: APP_ENVIRONMENT,
    firebaseApiKey: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_API_KEY"),
    firebaseAuthDomain: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    firebaseProjectId: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    firebaseStorageBucket: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    firebaseMessagingSenderId: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    firebaseAppId: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_APP_ID"),
    firebaseMeasurementId: getPublicEnvironment("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID"),
    cloudinaryCloudName: getPublicEnvironment("EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    cloudinaryUploadPreset: getPublicEnvironment("EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET"),
    backendApiUrl: getPublicEnvironment("EXPO_PUBLIC_BACKEND_API_URL"),
    invitationApiUrl: getPublicEnvironment("EXPO_PUBLIC_INVITATION_API_URL"),
    androidPackage: getPublicEnvironment("EXPO_PUBLIC_ANDROID_PACKAGE"),
    iosBundleIdentifier: getPublicEnvironment("EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER"),
  };
}

export default {
  APP_ENVIRONMENT,
  isDevelopment,
  isProduction,
  getPublicEnvironment,
  getEnvironmentConfig,
};
