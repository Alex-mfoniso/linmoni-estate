import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const staffApi = {
  // 1. Dashboard Summary
  getDashboard: (options = {}) =>
    apiRequest("/api/v1/staff/dashboard", options),

  // 2. Task Management
  getTasks: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/staff/tasks${apiQuery(filters)}`, options),

  getTask: (taskId, options = {}) =>
    apiRequest(`/api/v1/staff/tasks/${encodeURIComponent(taskId)}`, options),

  updateTask: (taskId, data, options = {}) =>
    apiRequest(`/api/v1/staff/tasks/${encodeURIComponent(taskId)}`, {
      method: "PATCH",
      body: data,
      ...options
    }),

  reassignTask: (taskId, assignedTo, options = {}) =>
    apiRequest(`/api/v1/staff/tasks/${encodeURIComponent(taskId)}/reassign`, {
      method: "PATCH",
      body: { assignedTo },
      ...options
    }),

  // 3. Property Review
  getPendingProperties: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/staff/properties/pending${apiQuery(filters)}`, options),

  getPropertyReview: (propertyId, options = {}) =>
    apiRequest(`/api/v1/staff/properties/${encodeURIComponent(propertyId)}/review`, options),

  verifyProperty: (propertyId, checklist = {}, options = {}) =>
    apiRequest(`/api/v1/staff/properties/${encodeURIComponent(propertyId)}/verify`, {
      method: "POST",
      body: { checklist },
      ...options
    }),

  requestPropertyChanges: (propertyId, reason, checklist = {}, options = {}) =>
    apiRequest(`/api/v1/staff/properties/${encodeURIComponent(propertyId)}/request-changes`, {
      method: "POST",
      body: { reason, checklist },
      ...options
    }),

  // 4. Inspection Management
  getInspections: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/staff/inspections${apiQuery(filters)}`, options),

  getInspection: (inspectionId, options = {}) =>
    apiRequest(`/api/v1/staff/inspections/${encodeURIComponent(inspectionId)}`, options),

  updateInspection: (inspectionId, data, options = {}) =>
    apiRequest(`/api/v1/staff/inspections/${encodeURIComponent(inspectionId)}`, {
      method: "PATCH",
      body: data,
      ...options
    }),

  // 5. Issue Tracking
  getIssues: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/staff/issues${apiQuery(filters)}`, options),

  getIssue: (issueId, options = {}) =>
    apiRequest(`/api/v1/staff/issues/${encodeURIComponent(issueId)}`, options),

  createIssue: (data, options = {}) =>
    apiRequest("/api/v1/staff/issues", {
      method: "POST",
      body: data,
      ...options
    }),

  updateIssue: (issueId, data, options = {}) =>
    apiRequest(`/api/v1/staff/issues/${encodeURIComponent(issueId)}`, {
      method: "PATCH",
      body: data,
      ...options
    }),

  // 6. Profile Settings
  getProfile: (options = {}) =>
    apiRequest("/api/v1/staff/profile", options),

  updateProfile: (data, options = {}) =>
    apiRequest("/api/v1/staff/profile", {
      method: "PATCH",
      body: data,
      ...options
    })
};
