export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || "com.example.linpalpremiumestates",
    versionCode: config.android?.versionCode || 1,
  },
  ios: {
    ...config.ios,
    bundleIdentifier:
      process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER || "com.example.linpalpremiumestates",
    buildNumber: config.ios?.buildNumber || "1",
  },
  extra: {
    ...config.extra,
    environmentName: process.env.EXPO_PUBLIC_APP_ENVIRONMENT || "development",
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    backendApiUrl: process.env.EXPO_PUBLIC_BACKEND_API_URL,
    invitationApiUrl: process.env.EXPO_PUBLIC_INVITATION_API_URL,
  },
});
