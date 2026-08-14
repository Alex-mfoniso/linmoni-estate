import { apiRequest } from "./apiClient";

export const profileApi = {
  get: (options = {}) => apiRequest("/api/v1/profile", options),
  update: ({ fullName, phone, avatar }) => apiRequest("/api/v1/profile", {
    method: "PATCH",
    body: { fullName, phone, avatar },
  }),
};
