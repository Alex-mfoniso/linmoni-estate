import { getFirebaseErrorMessage } from "./firebaseErrors";
import { getNetworkErrorMessage } from "./networkErrors";

export function getFriendlyErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const networkMessage = getNetworkErrorMessage(error);
  if (networkMessage) {
    return networkMessage;
  }

  const firebaseMessage = getFirebaseErrorMessage(error);
  if (firebaseMessage) {
    return firebaseMessage;
  }

  const message = String(error?.message || "").trim();
  if (message) {
    return message;
  }

  return fallback;
}
