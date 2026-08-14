import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "linpal_access_token";
const REFRESH_TOKEN_KEY = "linpal_refresh_token";

// Memory storage fallback for Web, tests, and unlinked simulators
let memoryStore = {};

/**
 * Checks if the expo-secure-store library is active and supported on the current runtime.
 */
async function isSecureStoreAvailable() {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Persist the access token securely.
 */
export async function saveAccessToken(token) {
  if (!token) {
    await clearAccessToken();
    return;
  }
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } else {
      memoryStore[ACCESS_TOKEN_KEY] = token;
    }
  } catch (error) {
    console.warn("SecureStore write failed, falling back to memory:", error);
    memoryStore[ACCESS_TOKEN_KEY] = token;
  }
}

/**
 * Retrieve the secure access token.
 */
export async function getAccessToken() {
  try {
    if (await isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
    return memoryStore[ACCESS_TOKEN_KEY] || null;
  } catch (error) {
    console.warn("SecureStore read failed, returning memory:", error);
    return memoryStore[ACCESS_TOKEN_KEY] || null;
  }
}

/**
 * Persist the secure refresh token.
 */
export async function saveRefreshToken(token) {
  if (!token) {
    await clearRefreshToken();
    return;
  }
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } else {
      memoryStore[REFRESH_TOKEN_KEY] = token;
    }
  } catch (error) {
    console.warn("SecureStore write failed, falling back to memory:", error);
    memoryStore[REFRESH_TOKEN_KEY] = token;
  }
}

/**
 * Retrieve the secure refresh token.
 */
export async function getRefreshToken() {
  try {
    if (await isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
    return memoryStore[REFRESH_TOKEN_KEY] || null;
  } catch (error) {
    console.warn("SecureStore read failed, returning memory:", error);
    return memoryStore[REFRESH_TOKEN_KEY] || null;
  }
}

/**
 * Clear only the access token.
 */
async function clearAccessToken() {
  delete memoryStore[ACCESS_TOKEN_KEY];
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    }
  } catch (err) {
    console.warn("SecureStore delete failed:", err);
  }
}

/**
 * Clear only the refresh token.
 */
async function clearRefreshToken() {
  delete memoryStore[REFRESH_TOKEN_KEY];
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (err) {
    console.warn("SecureStore delete failed:", err);
  }
}

/**
 * Purge all session credentials.
 */
export async function clearTokens() {
  memoryStore = {};
  try {
    if (await isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.warn("SecureStore wipe failed:", error);
  }
}
