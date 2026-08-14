import { getNetworkErrorMessage } from "./networkErrors";

/**
 * Universal utility to translate API, network, and application errors into user-friendly strings.
 */
export function getFriendlyErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const networkMessage = getNetworkErrorMessage(error);
  if (networkMessage) {
    return networkMessage;
  }

  const backendMessages = {
    PROFILE_MISSING: "No LINPAL profile is linked to this account.",
    ACCOUNT_DISABLED: "This account is currently unavailable.",
    ACCOUNT_SUSPENDED: "This account is currently unavailable.",
    ACCOUNT_PENDING: "Please verify your email before continuing.",
    SESSION_EXPIRED: "Your session has expired. Please sign in again.",
    REQUEST_TIMEOUT: "The request timed out. Please try again.",
    SERVICE_UNAVAILABLE: "The LINPAL service is temporarily unavailable."
  };

  if (backendMessages[error?.code]) {
    return backendMessages[error.code];
  }

  const message = String(error?.message || "").trim();
  if (message) {
    return message;
  }

  return fallback;
}
