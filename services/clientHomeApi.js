import { apiRequest } from "./apiClient";

export const clientHomeApi = {
  get: (options = {}) => apiRequest("/api/v1/client/home", options),
};
