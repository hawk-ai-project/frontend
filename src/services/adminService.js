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
  getActivityOverview: (params = {}) =>
    apiClient.get("/admin/activity/overview", { params }).then(({ data }) => data),
  getActivityLogs: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== "" && value != null),
    );
    return apiClient.get("/admin/activity", { params: cleanParams }).then(({ data }) => data);
  },
  getMonitoringOverview: () =>
    apiClient.get("/admin/monitoring/overview").then(({ data }) => data),
  updateMonitoringSettings: (payload) =>
    apiClient.put("/admin/monitoring/settings", payload).then(({ data }) => data),
  getSecurityOverview: () =>
    apiClient.get("/admin/security/overview").then(({ data }) => data),
  getSecuritySessions: (params = {}) => {
    const cleanParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));
    return apiClient.get("/admin/security/sessions", { params: cleanParams }).then(({ data }) => data);
  },
  revokeSecuritySession: (sessionId) =>
    apiClient.delete(`/admin/security/sessions/${sessionId}`).then(({ data }) => data),
  revokeAllSecuritySessions: (excludeCurrent = true) =>
    apiClient.post("/admin/security/sessions/revoke-all", { excludeCurrent }).then(({ data }) => data),
  getSettings: () => apiClient.get("/admin/settings").then(({ data }) => data),
  updateSettings: (payload) =>
    apiClient.put("/admin/settings", payload).then(({ data }) => data),
};
