import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const bookingApi = {
  list: (query = {}, options = {}) => apiRequest(`/api/v1/bookings${apiQuery(query)}`, options),
  create: ({ propertyId, scheduledAt, timezone, message }) => apiRequest("/api/v1/bookings", {
    method: "POST",
    body: { propertyId, scheduledAt, timezone, message },
  }),
  cancel: (bookingId, reason = "") => apiRequest(`/api/v1/bookings/${encodeURIComponent(bookingId)}/cancel`, {
    method: "PATCH",
    body: { reason },
  }),
};
