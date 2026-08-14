import { apiRequest } from "./apiClient";
import { apiQuery } from "../utils/clientPolicies.mjs";

export const propertyApi = {
  list: (filters = {}, options = {}) => apiRequest(`/api/v1/properties${apiQuery(filters)}`, options),
  featured: (limit = 6, options = {}) => apiRequest(`/api/v1/properties/featured${apiQuery({ limit })}`, options),
  recommended: (limit = 6, options = {}) => apiRequest(`/api/v1/properties/recommended${apiQuery({ limit })}`, options),
  get: (propertyId, options = {}) => apiRequest(`/api/v1/properties/${encodeURIComponent(propertyId)}`, options),
  similar: (propertyId, options = {}) => apiRequest(`/api/v1/properties/${encodeURIComponent(propertyId)}/similar`, options),
};
