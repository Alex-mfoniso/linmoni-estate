const FIREBASE_ERROR_MAP = {
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use": "That email is already in use.",
  "auth/weak-password": "Use a stronger password.",
  "auth/network-request-failed": "Network unavailable. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/requires-recent-login": "Please sign in again to continue.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
};

export function getFirebaseErrorMessage(error) {
  const code = String(error?.code || "").trim();
  if (code && FIREBASE_ERROR_MAP[code]) {
    return FIREBASE_ERROR_MAP[code];
  }

  return String(error?.message || "").trim();
}

export function hasFirebaseErrorCode(error, code) {
  return String(error?.code || "") === code;
}
