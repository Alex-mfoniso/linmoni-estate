import Constants from "expo-constants";
import { shouldRetryAuthRequest } from "../utils/authPolicy.mjs";
import { getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken, clearTokens } from "./authStorage";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || Constants.expoConfig?.extra?.backendApiUrl || "").replace(/\/$/, "");
const DEFAULT_TIMEOUT = 12000;
const activeControllers = new Set();

export class ApiClientError extends Error {
  constructor(message, { code = "API_ERROR", status = 0, errors = [], cause } = {}) {
    super(message, { cause });
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

export const shouldRetryWithFreshToken = shouldRetryAuthRequest;

export function cancelAuthenticatedRequests() {
  for (const controller of activeControllers) {
    controller.abort();
  }
  activeControllers.clear();
}

function makeDualEnvelope(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }
  const data = payload.data;
  if (data && (typeof data === "object" || typeof data === "function")) {
    try {
      if (!("success" in data)) {
        Object.defineProperty(data, "success", {
          get() { return payload.success; },
          configurable: true,
          enumerable: false
        });
      }
      if (!("message" in data)) {
        Object.defineProperty(data, "message", {
          get() { return payload.message; },
          configurable: true,
          enumerable: false
        });
      }
      if (!("code" in data)) {
        Object.defineProperty(data, "code", {
          get() { return payload.code; },
          configurable: true,
          enumerable: false
        });
      }
      if (!("data" in data)) {
        Object.defineProperty(data, "data", {
          get() { return data; },
          configurable: true,
          enumerable: false
        });
      }
    } catch (e) {
      console.warn("Failed to define dual envelope properties on payload.data:", e);
    }
    return data;
  }
  return payload;
}

/**
 * Robust API helper targeting LINPAL native endpoints.
 */
export async function apiRequest(path, options = {}) {
  const { method = "GET", body, authenticated = true, timeout = DEFAULT_TIMEOUT, signal, _retried = false } = options;
  if (!API_URL) {
    throw new ApiClientError("The LINPAL service is not configured.", { code: "SERVICE_UNAVAILABLE" });
  }

  const controller = new AbortController();
  activeControllers.add(controller);
  const timer = setTimeout(() => controller.abort("timeout"), timeout);
  const abortFromCaller = () => controller.abort(signal?.reason || "cancelled");
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    if (signal?.aborted) {
      controller.abort(signal.reason || "cancelled");
    }

    const headers = { Accept: "application/json", "Content-Type": "application/json" };

    if (authenticated) {
      const token = await getAccessToken();
      if (!token) {
        throw new ApiClientError("Your session has ended. Please sign in again.", { code: "SESSION_EXPIRED", status: 401 });
      }
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      // Catch 401 Unauthorized errors and trigger Token Refresh Rotation seamlessly
      if (authenticated && shouldRetryWithFreshToken(response.status, _retried)) {
        try {
          const rToken = await getRefreshToken();
          if (rToken) {
            const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh`, {
              method: "POST",
              headers: { Accept: "application/json", "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: rToken }),
              signal: controller.signal
            });

            if (refreshResponse.ok) {
              const refreshPayload = await refreshResponse.json();
              const nextAccessToken = refreshPayload?.data?.accessToken;
              const nextRefreshToken = refreshPayload?.data?.refreshToken;

              if (nextAccessToken) {
                await saveAccessToken(nextAccessToken);
                if (nextRefreshToken) {
                  await saveRefreshToken(nextRefreshToken);
                }
                // Retry the original request once with the new access token
                return apiRequest(path, { ...options, _retried: true });
              }
            }
          }
        } catch (refreshErr) {
          console.warn("Automated session credential refresh failed:", refreshErr);
        }

        // Wipe credentials and prompt re-login on refresh failure
        await clearTokens();
        throw new ApiClientError("Your session has expired. Please sign in again.", { code: "SESSION_EXPIRED", status: 401 });
      }

      throw new ApiClientError(
        payload?.message || "The service could not complete this request.",
        {
          code: payload?.code || `HTTP_${response.status}`,
          status: response.status,
          errors: payload?.errors || []
        }
      );
    }

    return makeDualEnvelope(payload);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error?.name === "AbortError" && signal?.aborted) {
      throw new ApiClientError("The request was cancelled.", { code: "REQUEST_CANCELLED", cause: error });
    }
    if (error?.name === "AbortError") {
      throw new ApiClientError("The request timed out. Please try again.", { code: "REQUEST_TIMEOUT", cause: error });
    }
    throw new ApiClientError("The LINPAL service is unavailable. Check your connection and try again.", { code: "NETWORK_UNAVAILABLE", cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
    activeControllers.delete(controller);
  }
}
