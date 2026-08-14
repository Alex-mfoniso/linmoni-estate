import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const realtorApi = {
  // 1. Dashboard Summary
  getDashboard: (options = {}) =>
    apiRequest("/api/v1/realtor/dashboard", options),

  // 2. Property Management
  getProperties: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/realtor/properties${apiQuery(filters)}`, options),

  getProperty: (propertyId, options = {}) =>
    apiRequest(`/api/v1/realtor/properties/${encodeURIComponent(propertyId)}`, options),

  createProperty: (data, options = {}) =>
    apiRequest("/api/v1/realtor/properties", {
      method: "POST",
      body: data,
      ...options
    }),

  updateProperty: (propertyId, data, options = {}) =>
    apiRequest(`/api/v1/realtor/properties/${encodeURIComponent(propertyId)}`, {
      method: "PATCH",
      body: data,
      ...options
    }),

  archiveProperty: (propertyId, options = {}) =>
    apiRequest(`/api/v1/realtor/properties/${encodeURIComponent(propertyId)}/archive`, {
      method: "PATCH",
      ...options
    }),

  // 3. Leads Management
  getLeads: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/realtor/leads${apiQuery(filters)}`, options),

  getLead: (leadId, options = {}) =>
    apiRequest(`/api/v1/realtor/leads/${encodeURIComponent(leadId)}`, options),

  updateLead: (leadId, data, options = {}) =>
    apiRequest(`/api/v1/realtor/leads/${encodeURIComponent(leadId)}`, {
      method: "PATCH",
      body: data,
      ...options
    }),

  // 4. Inspection Bookings
  getBookings: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/realtor/bookings${apiQuery(filters)}`, options),

  getBooking: (bookingId, options = {}) =>
    apiRequest(`/api/v1/realtor/bookings/${encodeURIComponent(bookingId)}`, options),

  confirmBooking: (bookingId, options = {}) =>
    apiRequest(`/api/v1/realtor/bookings/${encodeURIComponent(bookingId)}/confirm`, {
      method: "PATCH",
      ...options
    }),

  rejectBooking: (bookingId, options = {}) =>
    apiRequest(`/api/v1/realtor/bookings/${encodeURIComponent(bookingId)}/reject`, {
      method: "PATCH",
      ...options
    }),

  rescheduleBooking: (bookingId, scheduledAt, timezone = "Africa/Lagos", options = {}) =>
    apiRequest(`/api/v1/realtor/bookings/${encodeURIComponent(bookingId)}/reschedule`, {
      method: "PATCH",
      body: { scheduledAt, timezone },
      ...options
    }),

  completeBooking: (bookingId, options = {}) =>
    apiRequest(`/api/v1/realtor/bookings/${encodeURIComponent(bookingId)}/complete`, {
      method: "PATCH",
      ...options
    }),

  // 5. Messaging / Chats
  getConversations: (filters = {}, options = {}) =>
    apiRequest(`/api/v1/realtor/conversations${apiQuery(filters)}`, options),

  getMessages: (conversationId, filters = {}, options = {}) =>
    apiRequest(`/api/v1/realtor/conversations/${encodeURIComponent(conversationId)}/messages${apiQuery(filters)}`, options),

  sendMessage: (conversationId, text, options = {}) =>
    apiRequest(`/api/v1/realtor/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: "POST",
      body: { text },
      ...options
    }),

  markRead: (conversationId, options = {}) =>
    apiRequest(`/api/v1/realtor/conversations/${encodeURIComponent(conversationId)}/read`, {
      method: "PATCH",
      ...options
    }),

  // 6. Profile Settings
  getProfile: (options = {}) =>
    apiRequest("/api/v1/realtor/profile", options),

  updateProfile: (data, options = {}) =>
    apiRequest("/api/v1/realtor/profile", {
      method: "PATCH",
      body: data,
      ...options
    })
};
