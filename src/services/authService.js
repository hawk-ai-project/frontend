import { apiClient, refreshAccessToken } from "./apiClient";

export const authService = {
  login: (credentials) =>
    apiClient.post("/auth/login", credentials).then(({ data }) => data),
  signup: (payload) =>
    apiClient.post("/auth/signup", payload).then(({ data }) => data),
  me: () => apiClient.get("/auth/me").then(({ data }) => data),
  refresh: () => refreshAccessToken(),
  updateProfile: (payload) =>
    apiClient.patch("/auth/profile", payload).then(({ data }) => data),
  updateProfileImage: (file) => {
    const body = new FormData();
    body.append("file", file);
    return apiClient.patch("/auth/profile/image", body, { timeout: 30000 })
      .then(({ data }) => data);
  },
  getProfileImage: () =>
    apiClient.get("/auth/profile/image", { responseType: "blob" })
      .then(({ data }) => data),
  deleteProfileImage: () =>
    apiClient.delete("/auth/profile/image").then(({ data }) => data),
  logout: () => apiClient.post("/auth/logout").then(({ data }) => data),
};
