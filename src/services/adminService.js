import { apiClient } from "./apiClient";

export const adminService = {
  getDashboard: () => apiClient.get("/admin/dashboard").then(({ data }) => data),
  getUsers: (params = {}) => apiClient.get("/admin/users", { params }).then(({ data }) => data),
};
