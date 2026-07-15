export function isNetworkError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();

  return (
    code.includes("network") ||
    code.includes("offline") ||
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("offline")
  );
}

export function getNetworkErrorMessage(error) {
  if (isNetworkError(error)) {
    return "Network unavailable. Check your connection and try again.";
  }

  return "";
}
