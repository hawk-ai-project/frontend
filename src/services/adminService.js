import { apiClient } from "./apiClient";

export const adminService = {
  getDashboard: () => apiClient.get("/admin/dashboard").then(({ data }) => data),
  getUsers: (params = {}) => apiClient.get("/admin/users", { params }).then(({ data }) => data),
  getUserProfileImage: (userId) =>
    apiClient.get(`/admin/users/${userId}/profile-image`, { responseType: "blob" })
      .then(({ data }) => data),
  getRoles: () => apiClient.get("/admin/roles").then(({ data }) => data),
  updateUserRole: (userId, roleCode) =>
    apiClient.patch(`/admin/users/${userId}/role`, { roleCode }).then(({ data }) => data),
  getBoards: (params = {}) => apiClient.get("/admin/boards", { params }).then(({ data }) => data),
  updateBoardStatus: (boardId, status) =>
    apiClient.patch(`/admin/boards/${boardId}/status`, { status }).then(({ data }) => data),
  deleteBoard: (boardId) => apiClient.delete(`/admin/boards/${boardId}`),
  getSettings: () => apiClient.get("/admin/settings").then(({ data }) => data),
  updateSettings: (payload) =>
    apiClient.put("/admin/settings", payload).then(({ data }) => data),
};
