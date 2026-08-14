import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const adminApi = {
  // 1. Overview metrics
  getDashboard: (options = {}) =>
    apiRequest("/api/v1/admin/overview", options),

  // 2. User directories and moderation
  getUsers: (params = {}, options = {}) =>
    apiRequest(`/api/v1/admin/users${apiQuery(params)}`, options),

  getUserDetail: (userId, options = {}) =>
    apiRequest(`/api/v1/admin/users/${encodeURIComponent(userId)}`, options),

  updateUserStatus: (userId, status, reason, options = {}) =>
    apiRequest(`/api/v1/admin/users/${encodeURIComponent(userId)}/status`, {
      ...options,
      method: "PATCH",
      body: { status, reason }
    }),

  updateUserRole: (userId, role, reason, options = {}) =>
    apiRequest(`/api/v1/admin/users/${encodeURIComponent(userId)}/role`, {
      ...options,
      method: "PATCH",
      body: { role, reason }
    }),

  // 3. Properties oversight & approval queues
  getProperties: (params = {}, options = {}) =>
    apiRequest(`/api/v1/admin/properties${apiQuery(params)}`, options),

  getPropertyDetail: (propertyId, options = {}) =>
    apiRequest(`/api/v1/admin/properties/${encodeURIComponent(propertyId)}`, options),

  updateProperty: (propertyId, fields, options = {}) =>
    apiRequest(`/api/v1/admin/properties/${encodeURIComponent(propertyId)}`, {
      ...options,
      method: "PATCH",
      body: fields
    }),

  updatePropertyStatus: (propertyId, status, reason, options = {}) =>
    apiRequest(`/api/v1/admin/properties/${encodeURIComponent(propertyId)}/status`, {
      ...options,
      method: "PATCH",
      body: { status, reason }
    }),

  deleteProperty: (propertyId, reason, options = {}) =>
    apiRequest(`/api/v1/admin/properties/${encodeURIComponent(propertyId)}`, {
      ...options,
      method: "DELETE",
      body: { reason }
    }),

  // 4. Onboardings
  createStakeholder: (payload, options = {}) =>
    apiRequest("/api/v1/admin/stakeholders", {
      ...options,
      method: "POST",
      body: payload
    }),

  // 5. Global Configs
  getPlatformSettings: (options = {}) =>
    apiRequest("/api/v1/admin/settings", options),

  updatePlatformSettings: (payload, options = {}) =>
    apiRequest("/api/v1/admin/settings", {
      ...options,
      method: "PATCH",
      body: payload
    }),

  // 6. Append-only system logs audit trail
  getAuditLogs: (params = {}, options = {}) =>
    apiRequest(`/api/v1/admin/audit-logs${apiQuery(params)}`, options)
};
