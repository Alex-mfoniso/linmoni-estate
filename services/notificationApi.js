import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const notificationApi = {
  list: (query = {}, options = {}) => apiRequest(`/api/v1/notifications${apiQuery(query)}`, options),
  unreadCount: (options = {}) => apiRequest("/api/v1/notifications/unread-count", options),
  markRead: (notificationId) => apiRequest(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH", body: {} }),
  markAllRead: () => apiRequest("/api/v1/notifications/read-all", { method: "PATCH", body: {} }),
  remove: (notificationId) => apiRequest(`/api/v1/notifications/${encodeURIComponent(notificationId)}`, { method: "DELETE" }),
};
