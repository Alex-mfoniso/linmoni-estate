import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const conversationApi = {
  list: (query = {}, options = {}) => apiRequest(`/api/v1/conversations${apiQuery(query)}`, options),
  unreadCount: (options = {}) => apiRequest("/api/v1/conversations/unread-count", options),
  createForProperty: (propertyId) => apiRequest("/api/v1/conversations", { method: "POST", body: { propertyId } }),
  messages: (conversationId, query = {}, options = {}) => apiRequest(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages${apiQuery(query)}`, options),
  send: (conversationId, text) => apiRequest(`/api/v1/conversations/${encodeURIComponent(conversationId)}/messages`, { method: "POST", body: { text } }),
  markRead: (conversationId) => apiRequest(`/api/v1/conversations/${encodeURIComponent(conversationId)}/read`, { method: "PATCH", body: {} }),
};
