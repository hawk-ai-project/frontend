import { apiClient } from "./apiClient";

export const adminService = {
  getDashboard: () => apiClient.get("/admin/dashboard").then(({ data }) => data),
  getUsers: (params = {}) => apiClient.get("/admin/users", { params }).then(({ data }) => data),
  getRoles: () => apiClient.get("/admin/roles").then(({ data }) => data),
  updateUserRole: (userId, roleCode) =>
    apiClient.patch(`/admin/users/${userId}/role`, { roleCode }).then(({ data }) => data),
};
