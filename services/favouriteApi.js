import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const favouriteApi = {
  list: (query = {}, options = {}) => apiRequest(`/api/v1/favourites${apiQuery(query)}`, options),
  add: (propertyId) => apiRequest(`/api/v1/favourites/${encodeURIComponent(propertyId)}`, { method: "POST" }),
  remove: (propertyId) => apiRequest(`/api/v1/favourites/${encodeURIComponent(propertyId)}`, { method: "DELETE" }),
};
