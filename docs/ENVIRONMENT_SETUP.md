# Environment setup

Mobile public values: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `EXPO_PUBLIC_FIREBASE_APP_ID`. These are Firebase client configuration, not Admin secrets.

Server private values are listed with empty placeholders in `server/.env.example`: `NODE_ENV`, `PORT`, `MONGODB_URI`, `CLIENT_ORIGINS`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `LOG_LEVEL`. Use Node.js 22+. `CLIENT_ORIGINS` is comma-separated; production wildcard CORS is rejected. Store multiline private keys using escaped newlines; validation normalizes them in memory.

Enable Firebase Email/Password sign-in, configure authorized domains and verification templates, create a restricted service account, provision MongoDB with least privilege and network controls, configure exact web origins, and supply secrets through the deployment platform. Do not commit `.env` or service-account JSON.
