import { apiRequest } from "./apiClient";
import { saveAccessToken, saveRefreshToken, clearTokens, getRefreshToken } from "./authStorage";

/**
 * Service to execute client-side networking requests for authentication.
 * Replaces older Firebase-SDK client bindings.
 */

/**
 * Native Login verifying email + password.
 */
export async function login({ email, password }) {
  const res = await apiRequest("/api/v1/auth/login", {
    method: "POST",
    authenticated: false,
    body: { email: email.trim().toLowerCase(), password }
  });
  const result = res?.data;

  if (result?.accessToken) {
    await saveAccessToken(result.accessToken);
    await saveRefreshToken(result.refreshToken);
  }
  return result?.profile || result;
}

/**
 * Native Signup registering email + password.
 */
export async function registerClient({ email, password, fullName, phone }) {
  const res = await apiRequest("/api/v1/auth/register", {
    method: "POST",
    authenticated: false,
    body: {
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim()
    }
  });
  const result = res?.data;

  if (result?.accessToken) {
    await saveAccessToken(result.accessToken);
    await saveRefreshToken(result.refreshToken);
  }
  return result?.profile || result;
}

/**
 * Safe Current User Profile Retrieval.
 */
export const getCurrentUserProfile = () => apiRequest("/api/v1/auth/me");

/**
 * Profile Update.
 */
export const updateOwnProfile = (updates) => apiRequest("/api/v1/auth/me", { method: "PATCH", body: updates });

/**
 * Password Recovery workflow.
 */
export const forgotPassword = (email) =>
  apiRequest("/api/v1/auth/forgot-password", {
    method: "POST",
    authenticated: false,
    body: { email: email.trim().toLowerCase() }
  });

/**
 * Confirm password reset token.
 */
export const resetPassword = ({ token, email, password }) =>
  apiRequest("/api/v1/auth/reset-password", {
    method: "POST",
    authenticated: false,
    body: { token, email: email.trim().toLowerCase(), password }
  });

/**
 * Verify email verification token.
 */
export const verifyEmail = ({ token, email }) =>
  apiRequest("/api/v1/auth/verify-email", {
    method: "POST",
    authenticated: false,
    body: { token, email: email.trim().toLowerCase() }
  });

/**
 * Request brand new verification token.
 */
export const resendVerification = () => apiRequest("/api/v1/auth/resend-verification", { method: "POST" });

/**
 * Complete password change.
 */
export async function changePassword(newPassword) {
  return apiRequest("/api/v1/auth/complete-password-change", {
    method: "PATCH",
    body: { password: newPassword }
  });
}

/**
 * Terminate mobile session and revoke rotated refresh tokens.
 */
export async function logout() {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        body: { refreshToken }
      });
    }
  } catch (error) {
    console.warn("Backend logout registration failed:", error);
  } finally {
    await clearTokens();
  }
}
