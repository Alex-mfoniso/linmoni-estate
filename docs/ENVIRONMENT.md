# Environment Configuration

Use `.env` for local secrets and `.env.example` as the shared template.

## Required public variables

- `EXPO_PUBLIC_APP_ENVIRONMENT`
- `EXPO_PUBLIC_ANDROID_PACKAGE`
- `EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `EXPO_PUBLIC_BACKEND_API_URL`
- `EXPO_PUBLIC_INVITATION_API_URL`

## Notes

- Keep secrets out of source control.
- Use separate values for development, staging, and production.
- If a critical value is missing, show a development-friendly warning instead of a blank crash screen.
