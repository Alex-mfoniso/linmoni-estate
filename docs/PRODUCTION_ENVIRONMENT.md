# LINPAL Production Environment Configuration

This document specifies the environment variables, credentials, and profile settings required to deploy **LINPAL Premium Estates** in staging and production.

---

## 📱 Public Mobile Environment Variables (`my-app/.env`)

These public keys are compiled into the React Native client app. **Never place server credentials, service accounts, or private API secrets inside this file.**

| Variable Name | Type | Purpose | Example Value |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_APP_ENVIRONMENT` | String | Environment identifier | `production` |
| `EXPO_PUBLIC_API_URL` | URL | Central REST backend URL | `https://api.linpal.com/api/v1` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | String | Firebase client auth API Key | `AIzaSyDo7eZ8f_HjkO83gUAdjAbH06w_g-la7ak` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`| String | Firebase auth domain target | `lincon-2f739.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | String | Firebase project ID | `lincon-2f739` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`| String | Firebase assets storage bucket| `lincon-2f739.firebasestorage.app`|
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| String| Firebase sender account ID | `162332531737` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | String | Firebase app identifier key | `1:162332531737:web:a596c373285ca8a891de88`|
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`| String | Cloudinary cloud target | `dnartpsxj` |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| String| Cloudinary restricted upload preset| `lincon-estate` |

---

## 🔒 Private Backend Environment Variables (`server/.env`)

These private secrets are kept exclusively on the server. **Do not commit this file to Git.**

| Variable Name | Type | Purpose | Example / Production Setting |
| --- | --- | --- | --- |
| `NODE_ENV` | String | Server deployment mode | `production` |
| `PORT` | Number | Active listening port | `3000` |
| `MONGODB_URI` | URL | Production database connection | `mongodb+srv://[user]:[pass]@[cluster].mongodb.net/linpal` |
| `CLIENT_ORIGINS` | String | Whitelisted CORS clients origins | `https://linpal.com,http://localhost:8081` |
| `FIREBASE_PROJECT_ID` | String | Firebase private project ID | `lincon-2f739` |
| `FIREBASE_CLIENT_EMAIL`| String | Firebase service account email | `firebase-adminsdk@lincon-2f739.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY`| String | Private service certificate key| `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...` |
| `LOG_LEVEL` | String | Production logging verbosity | `info` |

---

## 📦 EAS Build Profiles (`eas.json`)

To build local development clients, staging APKs, or production bundles, execute the appropriate commands:

### 1. Build Staging APK (Preview)
```bash
eas build --profile preview --platform android
```

### 2. Build Production Bundle (AAB for Google Play Store)
```bash
eas build --profile production --platform android
```
