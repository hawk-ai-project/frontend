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
  getComments: (params = {}) =>
    apiClient.get("/admin/comments", { params }).then(({ data }) => data),
  getCommentDetail: (commentId) =>
    apiClient.get(`/admin/comments/${commentId}`).then(({ data }) => data),
  moderateComment: (commentId, action, reason) =>
    apiClient.post(`/admin/comments/${commentId}/moderate`, { action, reason }).then(({ data }) => data),
  getForbiddenWords: () => apiClient.get("/admin/forbidden-words").then(({ data }) => data),
  createForbiddenWord: (word) => apiClient.post("/admin/forbidden-words", { word }).then(({ data }) => data),
  toggleForbiddenWord: (wordId, isActive) => apiClient.patch(`/admin/forbidden-words/${wordId}`, { isActive }).then(({ data }) => data),
  deleteForbiddenWord: (wordId) => apiClient.delete(`/admin/forbidden-words/${wordId}`),
  getModerationFlags: (params = {}) => apiClient.get("/admin/moderation-flags", { params }).then(({ data }) => data),
  resolveModerationFlag: (flagId, status, note = "") => apiClient.post(`/admin/moderation-flags/${flagId}/resolve`, { status, note }).then(({ data }) => data),
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
  getAiDetections: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== "" && value != null),
    );
    return apiClient.get("/admin/ai/detections", { params: cleanParams }).then(({ data }) => data);
  },
  reviewAiDetection: (id, payload) =>
    apiClient.patch(`/admin/ai/detections/${id}`, payload).then(({ data }) => data),
  getAiStatistics: () =>
    apiClient.get("/admin/ai/statistics").then(({ data }) => data),

  getAiModels: () => apiClient.get("/admin/ai/models").then(({ data }) => data),
  getAiRecommendationSchedule: () => apiClient.get("/admin/ai/recommendation-schedule").then(({ data }) => data),
  updateAiRecommendationSchedule: (payload) => apiClient.put("/admin/ai/recommendation-schedule", payload).then(({ data }) => data),
  selectAiModel: (modelId) => apiClient.post(`/admin/ai/models/${modelId}/select`).then(({ data }) => data),
  setAiModelCandidate: (modelId, candidate) => apiClient.patch(`/admin/ai/models/${modelId}/candidate`, { candidate }).then(({ data }) => data),
  setAiModelCandidates: (modelIds, candidate) => apiClient.patch("/admin/ai/models/candidates", { modelIds, candidate }).then(({ data }) => data),
  getAiSystem: () => apiClient.get("/admin/ai/system").then(({ data }) => data),
  getAiModelDetail: (modelId) => apiClient.get(`/admin/ai/models/${modelId}`).then(({ data }) => data),
  getAiArtifact: (path) => apiClient.get(`/admin/ai/artifacts/${path}`, { responseType: "blob" }).then(({ data }) => data),
  getAiClasses: () =>
    apiClient.get("/admin/ai/classes").then(({ data }) => data),
  getAiData: (params = {}) => {
    const cleanParams=Object.fromEntries(Object.entries(params).filter(([,v])=>v!==""&&v!=null));
    return apiClient.get("/admin/ai/data",{params:cleanParams}).then(({data})=>data);
  },
  getAiTags: () => apiClient.get("/admin/ai/tags").then(({data})=>data),
  createAiTag: (payload) => apiClient.post("/admin/ai/tags",payload).then(({data})=>data),
  bulkAiData: (payload) => apiClient.post("/admin/ai/data/bulk",payload).then(({data})=>data),
  getInspectionImage: (inspectionId) =>
    apiClient.get(`/inspection/histories/${inspectionId}/image`,{params:{kind:"ORIGINAL"},responseType:"blob"}).then(({data})=>data),
  getAiDataDetail: (inspectionId) =>
    apiClient.get(`/admin/ai/data/${inspectionId}`).then(({data})=>data),
  createMissedDetection: (payload) =>
    apiClient.post("/admin/ai/missed-detections",payload).then(({data})=>data),
  deleteAiDetection: (id) => apiClient.delete(`/admin/ai/detections/${id}`),
};
