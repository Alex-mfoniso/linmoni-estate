import Constants from "expo-constants";
import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";
import { getAccessToken } from "./authStorage";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.expoConfig?.extra?.backendApiUrl ||
  ""
).replace(/\/$/, "");

/**
 * Construct secure header maps with native Bearer authorization.
 */
async function getHeaders() {
  const headers = {
    Accept: "text/csv, application/json"
  };
  try {
    const token = await getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Failed retrieving token:", err);
  }
  return headers;
}

export const stakeholderApi = {
  // 1. Portfolio Dashboards
  getDashboard: (params = {}, options = {}) =>
    apiRequest(`/api/v1/stakeholder/overview${apiQuery(params)}`, options),

  getPropertyAnalytics: (params = {}, options = {}) =>
    apiRequest(`/api/v1/stakeholder/analytics/properties${apiQuery(params)}`, options),

  getRealtorAnalytics: (params = {}, options = {}) =>
    apiRequest(`/api/v1/stakeholder/analytics/realtors${apiQuery(params)}`, options),

  getStaffAnalytics: (options = {}) =>
    apiRequest("/api/v1/stakeholder/analytics/staff", options),

  getActivityLogs: (params = {}, options = {}) =>
    apiRequest(`/api/v1/stakeholder/activity${apiQuery(params)}`, options),

  // 2. Profile Access
  getProfile: (options = {}) =>
    apiRequest("/api/v1/stakeholder/profile", options),

  updateProfile: (payload, options = {}) =>
    apiRequest("/api/v1/stakeholder/profile", { ...options, method: "PATCH", body: payload }),

  // 3. Document Exports (CSV / Text data streams)
  async exportPropertiesReport() {
    try {
      const headers = await getHeaders();
      const url = `${API_URL}/api/v1/stakeholder/reports/properties`;
      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return { success: true, data: text };
    } catch (err) {
      return { success: false, message: err?.message || "Export properties report failed." };
    }
  },

  async exportPerformanceReport() {
    try {
      const headers = await getHeaders();
      const url = `${API_URL}/api/v1/stakeholder/reports/performance`;
      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return { success: true, data: text };
    } catch (err) {
      return { success: false, message: err?.message || "Export performance report failed." };
    }
  },

  async exportOperationsReport() {
    try {
      const headers = await getHeaders();
      const url = `${API_URL}/api/v1/stakeholder/reports/operations`;
      const res = await fetch(url, { method: "GET", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      return { success: true, data: text };
    } catch (err) {
      return { success: false, message: err?.message || "Export operations report failed." };
    }
  }
};
